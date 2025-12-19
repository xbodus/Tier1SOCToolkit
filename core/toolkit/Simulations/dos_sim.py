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


async def run_burst(session, rate_per_sec=20):
    tasks = []
    for _ in range(rate_per_sec):
        tasks.append(asyncio.create_task(send_request(session)))

    await asyncio.gather(*tasks)


async def fetch(session_key):
    print("Starting DOS attack")
    stop_key = f"stop_logs_{session_key}"

    async with aiohttp.ClientSession() as session:
        while not cache.get(stop_key):
            await run_burst(session)

    print("Stopped DOS attack")


def start_dos_simulation(session_key):
    asyncio.run(fetch(session_key))
