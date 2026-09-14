import uuid
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

# DATABASE_URL points at Supabase's transaction-mode pgbouncer pooler, which
# multiplexes many client connections onto few backend Postgres connections.
# asyncpg's default prepared-statement names are deterministic per connection
# (__asyncpg_stmt_1__, _2__, ...), so two different pooled clients that land on
# the same backend socket can collide (DuplicatePreparedStatementError).
# statement_cache_size=0 disables asyncpg's own statement cache, and a random
# name generator avoids the deterministic naming collision — both are needed;
# see https://docs.sqlalchemy.org/en/20/dialects/postgresql.html#prepared-statement-cache
engine = create_async_engine(
    settings.database_url,
    pool_pre_ping=True,
    connect_args={
        "statement_cache_size": 0,
        "prepared_statement_name_func": lambda: f"__asyncpg_{uuid.uuid4()}__",
    },
)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
