from fastapi import FastAPI

from app.routers import additional_work, attendance, billing, dashboard, expenses, ledger, me, payments, sites, workers

app = FastAPI(title="ContractorBook API")

app.include_router(me.router, prefix="/api/v1")
app.include_router(workers.router, prefix="/api/v1")
app.include_router(sites.router, prefix="/api/v1")
app.include_router(attendance.router, prefix="/api/v1")
app.include_router(payments.router, prefix="/api/v1")
app.include_router(additional_work.router, prefix="/api/v1")
app.include_router(expenses.router, prefix="/api/v1")
app.include_router(billing.bills_router, prefix="/api/v1")
app.include_router(billing.receipts_router, prefix="/api/v1")
app.include_router(ledger.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
