#!/bin/sh
set -e

MASTER_HOST=${MASTER_HOST:-db} 
MASTER_PORT=${MASTER_PORT:-5432}
REPLICA_USER=${POSTGRES_USER:-postgres}

if [ -z "$(find "$PGDATA" -mindepth 1 -print -quit)" ]; then
    echo "Replica data directory ($PGDATA) is empty. Initializing from master $MASTER_HOST..."

    echo "Running pg_basebackup..."
 
    PGPASSWORD="$POSTGRES_PASSWORD" pg_basebackup \
        -h "$MASTER_HOST" \
        -p "$MASTER_PORT" \
        -U "$REPLICA_USER" \
        -D "$PGDATA" \
        -Fp -Xs -P -R -v

    if [ ! -f "$PGDATA/standby.signal" ] && [ ! -f "$PGDATA/recovery.signal" ]; then 
        echo "standby.signal / recovery.signal not found after pg_basebackup, creating standby.signal..."
        touch "$PGDATA/standby.signal"
    fi
    
    chown -R postgres:postgres "$PGDATA"
    chmod -R 0700 "$PGDATA"

    echo "Replica initialized from master."
else
    echo "Replica data directory ($PGDATA) is not empty. Assuming already initialized."

    if [ ! -f "$PGDATA/standby.signal" ] && [ ! -f "$PGDATA/recovery.signal" ]; then
        echo "Existing data directory, but no standby.signal/recovery.signal. Creating standby.signal to ensure replica mode."
        touch "$PGDATA/standby.signal"
        chown postgres:postgres "$PGDATA/standby.signal"
    fi
fi

echo "Starting PostgreSQL server in replica mode by calling original entrypoint..."

exec docker-entrypoint.sh postgres -c config_file=/etc/postgresql/postgresql.conf 