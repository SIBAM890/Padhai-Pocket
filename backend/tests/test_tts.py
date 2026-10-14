"""
Tests for Pure Odia Dialect Text-to-Speech (TTS) Endpoint
"""

import sys
from pathlib import Path
import pytest
from httpx import AsyncClient, ASGITransport

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from main import app


@pytest.fixture
def anyio_backend():
    return 'asyncio'


@pytest.mark.asyncio
async def test_tts_predefined_key():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/v1/tts?key=motion")
        assert res.status_code == 200
        assert res.headers["content-type"] == "audio/mpeg"
        assert len(res.content) > 1000


@pytest.mark.asyncio
async def test_tts_head_request():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.head("/v1/tts?key=sound_check")
        assert res.status_code == 200
        assert res.headers["content-type"] == "audio/mpeg"


@pytest.mark.asyncio
async def test_tts_post_json():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/v1/tts", json={"key": "remediation"})
        assert res.status_code == 200
        assert res.headers["content-type"] == "audio/mpeg"
        assert len(res.content) > 1000


@pytest.mark.asyncio
async def test_tts_missing_params():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/v1/tts")
        assert res.status_code == 400
