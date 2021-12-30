import os
import json
from hashlib import sha512
from uuid import uuid4

import aioredis
from aiohttp import web, WSMsgType, ClientSession

config = {
    'debug': json.loads(os.environ.get('DEBUG', 'false')),
    'redis_url': os.environ.get('REDIS_URL', 'redis://redis:6379'),
    'redis_max_connections': json.loads(os.environ.get('REDIS_POOLSIZE', '10')),
    'hash_url': os.environ['HASH_URL']
}

pool = aioredis.ConnectionPool.from_url(config['redis_url'], max_connections=config['redis_max_connections'])
redis = aioredis.Redis(connection_pool=pool)

servers = {}

routes = web.RouteTableDef()


@routes.post('/offer')
async def offer(request):
    request_data = await request.json()

    offer = request_data.get('offer')
    candidates = request_data.get('candidates', [])

    if not all((offer, candidates)):
        raise Exception()

    response_payload = {}

    server_name = request_data.get('server_name') or 'www'
    server_sockets = servers.get(server_name)
    if server_sockets:
        queue_key = str(uuid4())
        offer_payload = {
            'type': 'offer',
            'data': {
                'offer': offer,
                'candidates': candidates
            },
            'meta': {
                'queue_key': queue_key
            }
        }
        for ws in server_sockets.values():
            try:
                await ws.send_str(json.dumps(offer_payload))
            except Exception:
                pass

        try:
            server_data = await redis.blpop(queue_key, timeout=5)
        except TimeoutError:
            server_data = None
        finally:
            await redis.expire(queue_key, 5)

        if server_data:
            server_data = json.loads(server_data[1].decode('utf-8'))
            response_payload['answer'] = server_data['answer']
            response_payload['candidates'] = server_data['candidates']

    return web.json_response(response_payload)


@routes.get('/socket')
async def socket(request):
    ws = web.WebSocketResponse()
    ws.is_authenticated = False
    ws.server_name = ''
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
                await ws.close()
                break

            if type == 'close':
                await ws.close()
                break

            if type == 'connect':
                async with ClientSession() as session:
                    async with session.get(config['hash_url'] + data['name']) as resp:
                        hash = await resp.text()
                        if sha512(data['secret'].encode()).hexdigest() == hash.strip() or config['debug']:
                            ws.is_authenticated = True
                            ws.server_name = data['name']
                            try:
                                servers[data['name']][socket_id] = ws
                            except KeyError:
                                servers[data['name']] = {socket_id: ws}

                            payload = {
                                'type': 'connected'
                            }
                            await ws.send_str(json.dumps(payload))

            if not ws.is_authenticated:
                await ws.close()
                break

            if type == 'answer':
                queue_payload = {
                    'answer': data['answer'],
                    'candidates': data['candidates']
                }
                await redis.rpush(meta['queue_key'], json.dumps(queue_payload))

    try:
        servers[ws.server_name].pop(socket_id)
    except KeyError:
        pass

    return ws


app = web.Application()
if config['debug']:
    import aiohttp_debugtoolbar
    aiohttp_debugtoolbar.setup(app)

app.add_routes(routes)


if __name__ == '__main__':
    web.run_app(app)
