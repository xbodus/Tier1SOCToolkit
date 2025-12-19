import asyncio
import aiohttp
import random

from django.core.cache import cache


USERS = [
    {
        "ip": "123.10.168.10",
        "username": "keyunited",
        "password": "United343#",
    },
    {
        "ip": "169.20.205.101",
        "username": "chivalrousget",
        "password": "GetChivalrous99!"
    },
    {
        "ip": "220.50.150.60",
        "username": "tortoiseblock",
        "password": "ILoveTurtles85$"
    },
    {
        "ip": "123.50.220.16",
        "username": "inventlearning",
        "password": "P@ssW0rd*"
    },
    {
        "ip": "169.20.60.200",
        "username": "blushnegative",
        "password": "PositiveLuck404@"
    }]

BASE_URL = "https://localhost"

ENDPOINTS = ["/", "/signup", "/login", "/dashboard"]


async def send_request(session, headers, url):
    async with session.get(url, headers=headers, ssl=False) as response:
        await response.read()


async def start_traffic(session_key):
    print("Starting normal traffic")
    stop_key = f"stop_logs_{session_key}"

    async with aiohttp.ClientSession() as session:
        while not cache.get(stop_key):
            user = random.choice(USERS)
            endpoint = random.choice(ENDPOINTS)

            url = BASE_URL + endpoint

            headers = {
                "X-Spoofed-IP": user["ip"],
                "User-Agent": "Mozilla/5.0",
                "Referer": url,
            }

            await send_request(session, headers, url)

            await asyncio.sleep(2)

    print("Stopping normal traffic")


def start_normal_traffic(session_key):
    asyncio.run(start_traffic(session_key))