from fastapi import FastAPI

from app.routers import attendance, me, sites, workers

app = FastAPI(title="ContractorBook API")

app.include_router(me.router, prefix="/api/v1")
app.include_router(workers.router, prefix="/api/v1")
app.include_router(sites.router, prefix="/api/v1")
app.include_router(attendance.router, prefix="/api/v1")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
