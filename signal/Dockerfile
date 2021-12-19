FROM python
WORKDIR /app
RUN pip install aiohttp aiohttp_debugtoolbar aiohttp-devtools
ADD . /app
EXPOSE 9999
CMD python app.py
