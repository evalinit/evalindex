FROM python
WORKDIR /app
RUN pip install aiohttp aiohttp_debugtoolbar aiohttp-devtools redis>=4.2
ADD . /app
EXPOSE 8080
CMD python app.py
