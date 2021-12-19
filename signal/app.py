import os
import json
from aiohttp import web

app = web.Application()

config = {
    'debug': json.loads(os.environ.get('SIGNAL_DEBUG', 'false'))
}

if config['debug']:
    import aiohttp_debugtoolbar
    aiohttp_debugtoolbar.setup(app)


routes = web.RouteTableDef()


@routes.get('/signal/hello')
async def hello(request):
    return web.Response(text='Hello, world')


app.add_routes(routes)


if __name__ == '__main__':
    web.run_app(app)
