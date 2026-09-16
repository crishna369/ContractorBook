import uuid
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

# DATABASE_URL points at Supabase's transaction-mode pgbouncer pooler, which
# multiplexes many client connections onto few backend Postgres connections,
# potentially swapping which backend serves a given pooled client connection
# between transactions. This breaks server-side prepared statements two ways,
# both of which must be disabled (one is not enough):
#   - asyncpg's own statement_cache_size (LRU cache of prepared statements on
#     the raw asyncpg connection) causes deterministic names to collide across
#     pooled clients sharing a backend (DuplicatePreparedStatementError).
#   - SQLAlchemy's asyncpg dialect ALSO keeps its own independent prepared-
#     statement cache (prepared_statement_cache_size, default 100) at the
#     dialect level. A statement cached there may reference a name that was
#     prepared on a backend pgbouncer has since swapped away from
#     (InvalidSQLStatementNameError: prepared statement ... does not exist).
# A random name generator avoids the first; prepared_statement_cache_size=0
# avoids the second by forcing every execution to re-prepare instead of
# reusing a possibly-stale cached statement. See
# https://docs.sqlalchemy.org/en/20/dialects/postgresql.html#prepared-statement-cache
engine = create_async_engine(
    settings.database_url,
    pool_pre_ping=True,
    connect_args={
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
        "prepared_statement_name_func": lambda: f"__asyncpg_{uuid.uuid4()}__",
    },
)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
