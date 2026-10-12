"""
Padhai Pocket - Failure Injection Middleware
Implements FR-18 and S7: X-Failure-Mode header handling.

Behaviors:
- "timeout" -> Simulate Gemini timeout (returns cached plan payload or simulates timeout response)
- "500"     -> Return 500 Internal Server Error
- "slow"    -> 3-second delay

Rule: Only honored when ENV=demo. In other environments (e.g. prod), header is silently ignored.
"""

import os
import asyncio
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


class FailureInjectionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        env = os.environ.get("ENV", "demo").lower()
        failure_mode = request.headers.get("X-Failure-Mode")

        # Only honor when ENV=demo
        if env == "demo" and failure_mode:
            mode = failure_mode.strip().lower()

            if mode == "500":
                return JSONResponse(
                    status_code=500,
                    content={"error": "Injected 500 error from X-Failure-Mode"},
                )

            elif mode == "timeout":
                # Simulated timeout / cached fallback signal
                return JSONResponse(
                    status_code=504,
                    content={
                        "error": "Gemini timeout simulated",
                        "fallback": {
                            "planner": "cached",
                            "node": "FALLBACK",
                            "action": "cached_plan",
                        },
                    },
                )

            elif mode == "slow":
                # In real scenario wait 3 seconds; support test override or execute sleep
                delay = float(os.environ.get("SLOW_DELAY_SECONDS", "3.0"))
                await asyncio.sleep(delay)

        response = await call_next(request)
        return response
