import asyncio
import json
import os
from hashlib import sha512
from random import shuffle
from uuid import uuid4

from redis import asyncio as aioredis
from aiohttp import web, WSMsgType, ClientSession


async def create_app():
    app = web.Application()
    app['config'] = {
        'debug': json.loads(os.environ.get('DEBUG', 'false')),
        'redis_url': os.environ.get('REDIS_URL', 'redis://redis:6379'),
        'redis_poolsize': json.loads(os.environ.get('REDIS_POOLSIZE', '10')),
        'hash_url': os.environ['HASH_URL'],
        'domain': os.environ['DOMAIN']
    }

    app.add_routes([
        web.post('/message/{type}', message),
        web.get('/socket', socket)
    ])

    if app['config']['debug']:
        import aiohttp_debugtoolbar
        aiohttp_debugtoolbar.setup(app)

    app['servers'] = {}

    app['redis'] = aioredis.Redis.from_url(app['config']['redis_url'], max_connections=app['config']['redis_poolsize'])

    async def startup(app):
        async def send_message(message):
            data = json.loads(message['data'])
            server_sockets = list(app['servers'].get(data['server_name'], {}).values())
            shuffle(server_sockets)
            for ws in server_sockets:
                try:
                    await ws.send_json(data['message'])
                    break
                except Exception as e:
                    await ws.close()
                    raise

        def send_message_sync(message):
            asyncio.ensure_future(send_message(message))

        pubsub = app['redis'].pubsub()
        await pubsub.subscribe(messages=send_message_sync)

        app['redis_listener'] = asyncio.create_task(pubsub.run())

    async def shutdown(app):
        app['redis_listener'].cancel()
        await app['redis_listener']
        await app['redis'].close()

    app.on_startup.append(startup)
    app.on_shutdown.append(shutdown)

    return app


async def message(request):
    # TODO: limit message sizes
    request_data = await request.json()
    message_type = request.match_info['type']
    temp_queue_key = str(uuid4())
    message_payload = {
        'type': message_type,
        'data': request_data['data'],
        'meta': {
            'temp_queue_key': temp_queue_key
        }
    }

    server_name = request_data['server_name']
    if server_name.lower() == request.app['config']['domain']:
        server_name = 'www'

    redis_payload = {
        'server_name': server_name,
        'message': message_payload
    }

    await request.app['redis'].publish('messages', json.dumps(redis_payload))

    try:
        server_data = await request.app['redis'].blpop(temp_queue_key, timeout=5)
    except TimeoutError:
        server_data = None
    finally:
        await request.app['redis'].expire(temp_queue_key, 5)

    response_payload = {}
    if server_data:
        server_data = json.loads(server_data[1].decode('utf-8'))
        response_payload.update(server_data)

    return web.json_response(response_payload)


async def socket(request):
    ws = web.WebSocketResponse(heartbeat=20)
    is_authenticated = False
    server_name = ''
    await ws.prepare(request)

    socket_id = str(uuid4())

    async for msg in ws:
        if msg.type == WSMsgType.TEXT:
            try:
                parsed = json.loads(msg.data)
                type = parsed['type']
                data = parsed['data']
                meta = parsed.get('meta')
            except Exception:
                if msg.data == 'close':
                    await ws.close()
                continue

            if type == 'connect':
                async with ClientSession() as session:
                    async with session.get(request.app['config']['hash_url'] + data['name'].split('-')[0]) as resp:
                        hash = await resp.text()
                        if sha512(data['secret'].encode()).hexdigest() == hash.strip().lower() or request.app['config']['debug']:
                            is_authenticated = True
                            server_name = data['name']
                            try:
                                request.app['servers'][server_name][socket_id] = ws
                            except KeyError:
                                request.app['servers'][server_name] = {socket_id: ws}

                            payload = {
                                'data': {
                                    'type': 'connected'
                                }
                            }
                            await ws.send_json(payload)

            if not is_authenticated:
                await ws.close()
                break

            if type == 'response':
                await request.app['redis'].rpush(meta['temp_queue_key'], json.dumps(data))

    try:
        request.app['servers'][server_name].pop(socket_id)
    except KeyError:
        pass

    return ws


if __name__ == '__main__':
    web.run_app(create_app())
