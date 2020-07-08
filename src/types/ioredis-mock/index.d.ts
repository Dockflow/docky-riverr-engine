declare module 'ioredis-mock' {
    /*
     * Type definitions for ioredis-mock 4.16
     *
     * Project: https://github.com/stipsan/ioredis-mock
     *
     * This definitions are based on the definitions found on @types/ioredis
     * (https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/ioredis/index.d.ts)
     */

    type KeyType = string | Buffer;

    interface MultiOptions {
        pipeline: boolean;
    }

    interface PartialIORedis {
        append(key: KeyType, value: any, callback: (err: Error, res: number) => void): void;
        append(key: KeyType, value: any): Promise<number>;

        auth(password: string, callback: (err: Error, res: string) => void): void;
        auth(password: string): Promise<string>;

        bgrewriteaof(callback: (err: Error, res: string) => void): void;
        bgrewriteaof(): Promise<string>;

        bgsave(callback: (err: Error, res: string) => void): void;
        bgsave(): Promise<string>;

        brpoplpush(
            source: string,
            destination: string,
            timeout: number,
            callback: (err: Error, res: any) => void,
        ): void;
        brpoplpush(source: string, destination: string, timeout: number): Promise<any>;

        dbsize(callback: (err: Error, res: number) => void): void;
        dbsize(): Promise<number>;

        decr(key: KeyType, callback: (err: Error, res: number) => void): void;
        decr(key: KeyType): Promise<number>;

        decrby(key: KeyType, decrement: number, callback: (err: Error, res: number) => void): void;
        decrby(key: KeyType, decrement: number): Promise<number>;

        del(...keys: KeyType[]): Promise<number>;

        discard(callback: (err: Error, res: any) => void): void;
        discard(): Promise<any>;

        echo(message: string, callback: (err: Error, res: string) => void): void;
        echo(message: string): Promise<string>;

        eval(...args: any[]): any;

        exec(callback: (err: Error, res: any) => void): void;
        exec(): Promise<any>;

        exists(...keys: KeyType[]): Promise<number>;
        exists(key: KeyType, callback: (err: Error, res: number) => void): void;

        expire(key: KeyType, seconds: number, callback: (err: Error, res: 0 | 1) => void): void;
        expire(key: KeyType, seconds: number): Promise<0 | 1>;

        expireat(key: KeyType, timestamp: number, callback: (err: Error, res: 0 | 1) => void): void;
        expireat(key: KeyType, timestamp: number): Promise<0 | 1>;

        flushall(callback: (err: Error, res: string) => void): void;
        flushall(): Promise<string>;

        flushdb(callback: (err: Error, res: string) => void): void;
        flushdb(): Promise<string>;

        get(key: KeyType, callback: (err: Error, res: string | null) => void): void;
        get(key: KeyType): Promise<string | null>;

        getbit(key: KeyType, offset: number, callback: (err: Error, res: number) => void): void;
        getbit(key: KeyType, offset: number): Promise<number>;

        getrange(key: KeyType, start: number, end: number, callback: (err: Error, res: string) => void): void;
        getrange(key: KeyType, start: number, end: number): Promise<string>;

        getset(key: KeyType, value: any, callback: (err: Error, res: string | null) => void): void;
        getset(key: KeyType, value: any): Promise<string | null>;

        hdel(key: KeyType, ...fields: string[]): any;

        hexists(key: KeyType, field: string, callback: (err: Error, res: 0 | 1) => void): void;
        hexists(key: KeyType, field: string): Promise<0 | 1>;

        hget(key: KeyType, field: string, callback: (err: Error, res: string | null) => void): void;
        hget(key: KeyType, field: string): Promise<string | null>;

        hgetall(key: KeyType, callback: (err: Error, res: any) => void): void;
        hgetall(key: KeyType): Promise<any>;

        hincrby(key: KeyType, field: string, increment: number, callback: (err: Error, res: number) => void): void;
        hincrby(key: KeyType, field: string, increment: number): Promise<number>;

        hincrbyfloat(key: KeyType, field: string, increment: number, callback: (err: Error, res: number) => void): void;
        hincrbyfloat(key: KeyType, field: string, increment: number): Promise<number>;

        hkeys(key: KeyType, callback: (err: Error, res: any) => void): void;
        hkeys(key: KeyType): Promise<any>;

        hlen(key: KeyType, callback: (err: Error, res: number) => void): void;
        hlen(key: KeyType): Promise<number>;

        hmget(key: KeyType, ...fields: string[]): any;

        hmset(key: KeyType, ...args: any[]): Promise<0 | 1>;
        hmset(key: KeyType, data: any, callback: (err: Error, res: 0 | 1) => void): void;
        hmset(key: KeyType, data: any): Promise<0 | 1>;

        hscan(key: KeyType, cursor: number, ...args: any[]): any;

        hset(key: KeyType, field: string, value: any, callback: (err: Error, res: 0 | 1) => void): void;
        hset(key: KeyType, field: string, value: any): Promise<0 | 1>;

        hsetnx(key: KeyType, field: string, value: any, callback: (err: Error, res: 0 | 1) => void): void;
        hsetnx(key: KeyType, field: string, value: any): Promise<0 | 1>;

        hstrlen(key: KeyType, field: string, callback?: (err: Error, res: number) => void): void;
        hstrlen(key: KeyType, field: string): Promise<number>;

        hvals(key: KeyType, callback: (err: Error, res: any) => void): void;
        hvals(key: KeyType): Promise<any>;

        incr(key: KeyType, callback: (err: Error, res: number) => void): void;
        incr(key: KeyType): Promise<number>;

        incrby(key: KeyType, increment: number, callback: (err: Error, res: number) => void): void;
        incrby(key: KeyType, increment: number): Promise<number>;

        incrbyfloat(key: KeyType, increment: number, callback: (err: Error, res: number) => void): void;
        incrbyfloat(key: KeyType, increment: number): Promise<number>;

        keys(pattern: string, callback: (err: Error, res: string[]) => void): void;
        keys(pattern: string): Promise<string[]>;

        lastsave(callback: (err: Error, res: number) => void): void;
        lastsave(): Promise<number>;

        lindex(key: KeyType, index: number, callback: (err: Error, res: string) => void): void;
        lindex(key: KeyType, index: number): Promise<string>;

        llen(key: KeyType, callback: (err: Error, res: number) => void): void;
        llen(key: KeyType): Promise<number>;

        lpop(key: KeyType, callback: (err: Error, res: string) => void): void;
        lpop(key: KeyType): Promise<string>;

        lpush(key: KeyType, ...values: any[]): any;

        lpushx(key: KeyType, value: any, callback: (err: Error, res: number) => void): void;
        lpushx(key: KeyType, value: any): Promise<number>;

        lrange(key: KeyType, start: number, stop: number, callback: (err: Error, res: any) => void): void;
        lrange(key: KeyType, start: number, stop: number): Promise<any>;

        lrem(key: KeyType, count: number, value: any, callback: (err: Error, res: number) => void): void;
        lrem(key: KeyType, count: number, value: any): Promise<number>;

        lset(key: KeyType, index: number, value: any, callback: (err: Error, res: any) => void): void;
        lset(key: KeyType, index: number, value: any): Promise<any>;

        ltrim(key: KeyType, start: number, stop: number, callback: (err: Error, res: any) => void): void;
        ltrim(key: KeyType, start: number, stop: number): Promise<any>;

        mget(...keys: KeyType[]): any;

        mset(...args: any[]): any;
        mset(data: any, callback: (err: Error, res: string) => void): void;
        mset(data: any): Promise<string>;

        msetnx(...args: any[]): any;
        msetnx(data: any, callback: (err: Error, res: 0 | 1) => void): void;
        msetnx(data: any): Promise<0 | 1>;

        multi(commands?: string[][], options?: MultiOptions): Pipeline;
        multi(options: { pipeline: false }): Promise<string>;

        persist(key: KeyType, callback: (err: Error, res: 0 | 1) => void): void;
        persist(key: KeyType): Promise<0 | 1>;

        pexpire(key: KeyType, milliseconds: number, callback: (err: Error, res: 0 | 1) => void): void;
        pexpire(key: KeyType, milliseconds: number): Promise<0 | 1>;

        pexpireat(key: KeyType, millisecondsTimestamp: number, callback: (err: Error, res: 0 | 1) => void): void;
        pexpireat(key: KeyType, millisecondsTimestamp: number): Promise<0 | 1>;

        ping(callback: (err: Error, res: string) => void): void;
        ping(message: string, callback: (err: Error, res: string) => void): void;
        ping(message?: string): Promise<string>;

        psetex(key: KeyType, milliseconds: number, value: any, callback: (err: Error, res: any) => void): void;
        psetex(key: KeyType, milliseconds: number, value: any): Promise<any>;

        psubscribe(...patterns: string[]): any;

        pttl(key: KeyType, callback: (err: Error, res: number) => void): void;
        pttl(key: KeyType): Promise<number>;

        publish(channel: string, message: string, callback: (err: Error, res: number) => void): void;
        publish(channel: string, message: string): Promise<number>;

        punsubscribe(...patterns: string[]): any;

        quit(callback: (err: Error, res: string) => void): void;
        quit(): Promise<string>;

        randomkey(callback: (err: Error, res: string) => void): void;
        randomkey(): Promise<string>;

        rename(key: KeyType, newkey: KeyType, callback: (err: Error, res: string) => void): void;
        rename(key: KeyType, newkey: KeyType): Promise<string>;

        renamenx(key: KeyType, newkey: KeyType, callback: (err: Error, res: 0 | 1) => void): void;
        renamenx(key: KeyType, newkey: KeyType): Promise<0 | 1>;

        role(): any;

        rpop(key: KeyType, callback: (err: Error, res: string) => void): void;
        rpop(key: KeyType): Promise<string>;

        rpoplpush(source: string, destination: string, callback: (err: Error, res: string) => void): void;
        rpoplpush(source: string, destination: string): Promise<string>;

        rpush(key: KeyType, ...values: any[]): any;

        rpushx(key: KeyType, value: any, callback: (err: Error, res: number) => void): void;
        rpushx(key: KeyType, value: any): Promise<number>;

        sadd(key: KeyType, ...members: any[]): any;

        save(callback: (err: Error, res: string) => void): void;
        save(): Promise<string>;

        scan(cursor: number): Promise<[string, string[]]>;
        scan(cursor: number, matchOption: 'match' | 'MATCH', pattern: string): Promise<[string, string[]]>;
        scan(cursor: number, countOption: 'count' | 'COUNT', count: number): Promise<[string, string[]]>;
        scan(
            cursor: number,
            matchOption: 'match' | 'MATCH',
            pattern: string,
            countOption: 'count' | 'COUNT',
            count: number,
        ): Promise<[string, string[]]>;
        scan(
            cursor: number,
            countOption: 'count' | 'COUNT',
            count: number,
            matchOption: 'match' | 'MATCH',
            pattern: string,
        ): Promise<[string, string[]]>;

        scard(key: KeyType, callback: (err: Error, res: number) => void): void;
        scard(key: KeyType): Promise<number>;

        sdiff(...keys: KeyType[]): any;

        set(
            key: KeyType,
            value: any,
            expiryMode?: string | any[],
            time?: number | string,
            setMode?: number | string,
        ): Promise<string>;
        set(key: KeyType, value: any, callback: (err: Error, res: string) => void): void;
        set(key: KeyType, value: any, setMode: string | any[], callback: (err: Error, res: string) => void): void;
        set(
            key: KeyType,
            value: any,
            expiryMode: string,
            time: number | string,
            callback: (err: Error, res: string) => void,
        ): void;
        set(
            key: KeyType,
            value: any,
            expiryMode: string,
            time: number | string,
            setMode: number | string,
            callback: (err: Error, res: string) => void,
        ): void;

        setbit(key: KeyType, offset: number, value: any, callback: (err: Error, res: number) => void): void;
        setbit(key: KeyType, offset: number, value: any): Promise<number>;

        setex(key: KeyType, seconds: number, value: any, callback: (err: Error, res: any) => void): void;
        setex(key: KeyType, seconds: number, value: any): Promise<any>;

        setnx(key: KeyType, value: any, callback: (err: Error, res: any) => void): void;
        setnx(key: KeyType, value: any): Promise<any>;

        sinter(...keys: KeyType[]): any;

        sismember(key: KeyType, member: string, callback: (err: Error, res: 1 | 0) => void): void;
        sismember(key: KeyType, member: string): Promise<1 | 0>;

        smembers(key: KeyType, callback: (err: Error, res: any) => void): void;
        smembers(key: KeyType): Promise<any>;

        smove(source: string, destination: string, member: string, callback: (err: Error, res: string) => void): void;
        smove(source: string, destination: string, member: string): Promise<string>;

        spop(key: KeyType, callback: (err: Error, res: any) => void): void;
        spop(key: KeyType, count: number, callback: (err: Error, res: any) => void): void;
        spop(key: KeyType, count?: number): Promise<any>;

        srandmember(key: KeyType, callback: (err: Error, res: any) => void): void;
        srandmember(key: KeyType, count: number, callback: (err: Error, res: any) => void): void;
        srandmember(key: KeyType, count?: number): Promise<any>;

        srem(key: KeyType, ...members: any[]): any;

        sscan(key: KeyType, cursor: number, ...args: any[]): any;

        subscribe(...channels: any[]): any;

        sunion(...keys: KeyType[]): any;

        time(callback: (err: Error, res: any) => void): void;
        time(): Promise<any>;

        ttl(key: KeyType, callback: (err: Error, res: number) => void): void;
        ttl(key: KeyType): Promise<number>;

        type(key: KeyType, callback: (err: Error, res: string) => void): void;
        type(key: KeyType): Promise<string>;

        unsubscribe(...channels: string[]): any;

        xadd(key: KeyType, id: string, ...args: string[]): any;
        xadd(key: KeyType, maxLenOption: 'MAXLEN' | 'maxlen', count: number, ...args: string[]): any;
        xadd(key: KeyType, maxLenOption: 'MAXLEN' | 'maxlen', approximate: '~', count: number, ...args: string[]): any;

        xlen(key: KeyType): any;

        xrange(key: KeyType, start: string, end: string, ...args: any[]): any;

        xread(...args: any[]): any;

        xrevrange(key: KeyType, end: string, start: string, ...args: any[]): any;

        zadd(key: KeyType, ...args: string[]): Promise<number | string>;

        zcard(key: KeyType, callback: (err: Error, res: number) => void): void;
        zcard(key: KeyType): Promise<number>;

        zcount(
            key: KeyType,
            min: number | string,
            max: number | string,
            callback: (err: Error, res: number) => void,
        ): void;
        zcount(key: KeyType, min: number | string, max: number | string): Promise<number>;

        zincrby(key: KeyType, increment: number, member: string, callback: (err: Error, res: any) => void): void;
        zincrby(key: KeyType, increment: number, member: string): Promise<any>;

        zrange(key: KeyType, start: number, stop: number, callback: (err: Error, res: any) => void): void;
        zrange(
            key: KeyType,
            start: number,
            stop: number,
            withScores: 'WITHSCORES',
            callback: (err: Error, res: any) => void,
        ): void;
        zrange(key: KeyType, start: number, stop: number, withScores?: 'WITHSCORES'): Promise<any>;

        zrangebyscore(key: KeyType, min: number | string, max: number | string, ...args: string[]): any;

        zrem(key: KeyType, ...members: any[]): any;

        zremrangebyrank(key: KeyType, start: number, stop: number, callback: (err: Error, res: any) => void): void;
        zremrangebyrank(key: KeyType, start: number, stop: number): Promise<any>;

        zremrangebyscore(
            key: KeyType,
            min: number | string,
            max: number | string,
            callback: (err: Error, res: any) => void,
        ): void;
        zremrangebyscore(key: KeyType, min: number | string, max: number | string): Promise<any>;

        zrevrangebyscore(key: KeyType, max: number | string, min: number | string, ...args: string[]): any;

        zscan(key: KeyType, cursor: number, ...args: any[]): any;

        zscore(key: KeyType, member: string, callback: (err: Error, res: string) => void): void;
        zscore(key: KeyType, member: string): Promise<string>;
    }

    interface Pipeline {
        append(key: KeyType, value: any, callback?: (err: Error, res: number) => void): Pipeline;

        auth(password: string, callback?: (err: Error, res: string) => void): Pipeline;

        bgrewriteaof(callback?: (err: Error, res: string) => void): Pipeline;

        bgsave(callback?: (err: Error, res: string) => void): Pipeline;

        brpoplpush(
            source: string,
            destination: string,
            timeout: number,
            callback?: (err: Error, res: any) => void,
        ): Pipeline;

        dbsize(callback?: (err: Error, res: number) => void): Pipeline;

        decr(key: KeyType, callback?: (err: Error, res: number) => void): Pipeline;

        decrby(key: KeyType, decrement: number, callback?: (err: Error, res: number) => void): Pipeline;

        del(...keys: KeyType[]): Pipeline;

        discard(callback?: (err: Error, res: any) => void): Pipeline;

        echo(message: string, callback?: (err: Error, res: string) => void): Pipeline;

        eval(...args: any[]): Pipeline;

        exec(callback?: (err: Error, res: any) => void): Promise<any>;

        exists(...keys: KeyType[]): Pipeline;

        expire(key: KeyType, seconds: number, callback?: (err: Error, res: 0 | 1) => void): Pipeline;

        expireat(key: KeyType, timestamp: number, callback?: (err: Error, res: 0 | 1) => void): Pipeline;

        flushall(callback?: (err: Error, res: string) => void): Pipeline;

        flushdb(callback?: (err: Error, res: string) => void): Pipeline;

        get(key: KeyType, callback?: (err: Error, res: string) => void): Pipeline;

        getbit(key: KeyType, offset: number, callback?: (err: Error, res: number) => void): Pipeline;

        getrange(key: KeyType, start: number, end: number, callback?: (err: Error, res: string) => void): Pipeline;

        getset(key: KeyType, value: any, callback?: (err: Error, res: string) => void): Pipeline;

        hdel(key: KeyType, ...fields: string[]): Pipeline;

        hexists(key: KeyType, field: string, callback?: (err: Error, res: 0 | 1) => void): Pipeline;

        hget(key: KeyType, field: string, callback?: (err: Error, res: string | string) => void): Pipeline;

        hgetall(key: KeyType, callback?: (err: Error, res: any) => void): Pipeline;

        hincrby(key: KeyType, field: string, increment: number, callback?: (err: Error, res: number) => void): Pipeline;

        hincrbyfloat(
            key: KeyType,
            field: string,
            increment: number,
            callback?: (err: Error, res: number) => void,
        ): Pipeline;

        hkeys(key: KeyType, callback?: (err: Error, res: any) => void): Pipeline;

        hlen(key: KeyType, callback?: (err: Error, res: number) => void): Pipeline;

        hmget(key: KeyType, ...fields: string[]): Pipeline;

        hmset(key: KeyType, ...args: any[]): Pipeline;
        hmset(key: KeyType, data: any, callback?: (err: Error, res: 0 | 1) => void): Pipeline;

        hscan(key: KeyType, cursor: number, ...args: any[]): Pipeline;

        hset(key: KeyType, field: string, value: any, callback?: (err: Error, res: 0 | 1) => void): Pipeline;

        hsetnx(key: KeyType, field: string, value: any, callback?: (err: Error, res: 0 | 1) => void): Pipeline;

        hstrlen(key: KeyType, field: string, callback?: (err: Error, res: number) => void): Pipeline;

        hvals(key: KeyType, callback?: (err: Error, res: any) => void): Pipeline;

        incr(key: KeyType, callback?: (err: Error, res: number) => void): Pipeline;

        incrby(key: KeyType, increment: number, callback?: (err: Error, res: number) => void): Pipeline;

        incrbyfloat(key: KeyType, increment: number, callback?: (err: Error, res: number) => void): Pipeline;

        keys(pattern: string, callback?: (err: Error, res: string[]) => void): Pipeline;

        lastsave(callback?: (err: Error, res: number) => void): Pipeline;

        lindex(key: KeyType, index: number, callback?: (err: Error, res: string) => void): Pipeline;

        llen(key: KeyType, callback?: (err: Error, res: number) => void): Pipeline;

        lpop(key: KeyType, callback?: (err: Error, res: string) => void): Pipeline;

        lpush(key: KeyType, ...values: any[]): Pipeline;

        lpushx(key: KeyType, value: any, callback?: (err: Error, res: number) => void): Pipeline;

        lrange(key: KeyType, start: number, stop: number, callback?: (err: Error, res: any) => void): Pipeline;

        lrem(key: KeyType, count: number, value: any, callback?: (err: Error, res: number) => void): Pipeline;

        lset(key: KeyType, index: number, value: any, callback?: (err: Error, res: any) => void): Pipeline;

        ltrim(key: KeyType, start: number, stop: number, callback?: (err: Error, res: any) => void): Pipeline;

        mget(...keys: KeyType[]): Pipeline;

        mset(...args: any[]): Pipeline;
        mset(data: any, callback?: (err: Error, res: string) => void): Pipeline;

        msetnx(...args: any[]): Pipeline;
        msetnx(data: any, callback?: (err: Error, res: 0 | 1) => void): Pipeline;

        multi(callback?: (err: Error, res: string) => void): Pipeline;

        persist(key: KeyType, callback?: (err: Error, res: 0 | 1) => void): Pipeline;

        pexpire(key: KeyType, milliseconds: number, callback?: (err: Error, res: 0 | 1) => void): Pipeline;

        pexpireat(key: KeyType, millisecondsTimestamp: number, callback?: (err: Error, res: 0 | 1) => void): Pipeline;

        ping(callback?: (err: Error, res: string) => void): Pipeline;
        ping(message: string, callback?: (err: Error, res: string) => void): Pipeline;

        psetex(key: KeyType, milliseconds: number, value: any, callback?: (err: Error, res: any) => void): Pipeline;

        psubscribe(...patterns: string[]): Pipeline;

        pttl(key: KeyType, callback?: (err: Error, res: number) => void): Pipeline;

        publish(channel: string, message: string, callback?: (err: Error, res: number) => void): Pipeline;

        punsubscribe(...patterns: string[]): Pipeline;

        quit(callback?: (err: Error, res: string) => void): Pipeline;

        randomkey(callback?: (err: Error, res: string) => void): Pipeline;

        rename(key: KeyType, newkey: KeyType, callback?: (err: Error, res: string) => void): Pipeline;

        renamenx(key: KeyType, newkey: KeyType, callback?: (err: Error, res: 0 | 1) => void): Pipeline;

        role(callback?: (err: Error, res: any) => void): Pipeline;

        rpop(key: KeyType, callback?: (err: Error, res: string) => void): Pipeline;

        rpoplpush(source: string, destination: string, callback?: (err: Error, res: string) => void): Pipeline;

        rpush(key: KeyType, ...values: any[]): Pipeline;

        rpushx(key: KeyType, value: any, callback?: (err: Error, res: number) => void): Pipeline;

        sadd(key: KeyType, ...members: any[]): Pipeline;

        save(callback?: (err: Error, res: string) => void): Pipeline;

        scan(cursor: number): Pipeline;
        scan(cursor: number, matchOption: 'match' | 'MATCH', pattern: string): Pipeline;
        scan(cursor: number, countOption: 'count' | 'COUNT', count: number): Pipeline;
        scan(
            cursor: number,
            matchOption: 'match' | 'MATCH',
            pattern: string,
            countOption: 'count' | 'COUNT',
            count: number,
        ): Pipeline;
        scan(
            cursor: number,
            countOption: 'count' | 'COUNT',
            count: number,
            matchOption: 'match' | 'MATCH',
            pattern: string,
        ): Pipeline;

        scard(key: KeyType, callback?: (err: Error, res: number) => void): Pipeline;

        sdiff(...keys: KeyType[]): Pipeline;

        set(key: KeyType, value: any, callback?: (err: Error, res: string) => void): Pipeline;
        set(key: KeyType, value: any, setMode: string, callback?: (err: Error, res: string) => void): Pipeline;
        set(
            key: KeyType,
            value: any,
            expiryMode: string,
            time: number,
            callback?: (err: Error, res: string) => void,
        ): Pipeline;
        set(
            key: KeyType,
            value: any,
            expiryMode: string,
            time: number,
            setMode: string,
            callback?: (err: Error, res: string) => void,
        ): Pipeline;

        setbit(key: KeyType, offset: number, value: any, callback?: (err: Error, res: number) => void): Pipeline;

        setex(key: KeyType, seconds: number, value: any, callback?: (err: Error, res: any) => void): Pipeline;

        setnx(key: KeyType, value: any, callback?: (err: Error, res: any) => void): Pipeline;

        sinter(...keys: KeyType[]): Pipeline;

        sismember(key: KeyType, member: string, callback?: (err: Error, res: 1 | 0) => void): Pipeline;

        smembers(key: KeyType, callback?: (err: Error, res: any) => void): Pipeline;

        smove(
            source: string,
            destination: string,
            member: string,
            callback?: (err: Error, res: string) => void,
        ): Pipeline;

        spop(key: KeyType, callback?: (err: Error, res: any) => void): Pipeline;
        spop(key: KeyType, count: number, callback?: (err: Error, res: any) => void): Pipeline;

        srandmember(key: KeyType, callback?: (err: Error, res: any) => void): Pipeline;
        srandmember(key: KeyType, count: number, callback?: (err: Error, res: any) => void): Pipeline;

        srem(key: KeyType, ...members: any[]): Pipeline;

        sscan(key: KeyType, cursor: number, ...args: any[]): Pipeline;

        subscribe(...channels: any[]): Pipeline;

        sunion(...keys: KeyType[]): Pipeline;

        time(callback?: (err: Error, res: any) => void): Pipeline;

        ttl(key: KeyType, callback?: (err: Error, res: number) => void): Pipeline;

        type(key: KeyType, callback?: (err: Error, res: string) => void): Pipeline;

        unsubscribe(...channels: string[]): Pipeline;

        xadd(key: KeyType, id: string, ...args: string[]): Pipeline;

        xlen(key: KeyType): Pipeline;

        xrange(key: KeyType, start: string, end: string, ...args: any[]): Pipeline;

        xread(...args: any[]): Pipeline;

        xrevrange(key: KeyType, end: string, start: string, ...args: any[]): Pipeline;

        zadd(key: KeyType, ...args: string[]): Pipeline;

        zcard(key: KeyType, callback?: (err: Error, res: number) => void): Pipeline;

        zcount(
            key: KeyType,
            min: number | string,
            max: number | string,
            callback?: (err: Error, res: number) => void,
        ): Pipeline;

        zincrby(key: KeyType, increment: number, member: string, callback?: (err: Error, res: any) => void): Pipeline;

        zrange(key: KeyType, start: number, stop: number, callback?: (err: Error, res: any) => void): Pipeline;
        zrange(
            key: KeyType,
            start: number,
            stop: number,
            withScores: 'WITHSCORES',
            callback?: (err: Error, res: any) => void,
        ): Pipeline;

        zrangebyscore(key: KeyType, min: number | string, max: number | string, ...args: string[]): Pipeline;

        zrem(key: KeyType, ...members: any[]): Pipeline;

        zremrangebyrank(key: KeyType, start: number, stop: number, callback?: (err: Error, res: any) => void): Pipeline;

        zremrangebyscore(
            key: KeyType,
            min: number | string,
            max: number | string,
            callback?: (err: Error, res: any) => void,
        ): Pipeline;

        zrevrange(key: KeyType, start: number, stop: number, callback?: (err: Error, res: any) => void): Pipeline;
        zrevrange(
            key: KeyType,
            start: number,
            stop: number,
            withScores: 'WITHSCORES',
            callback?: (err: Error, res: any) => void,
        ): Pipeline;

        zrevrangebyscore(key: KeyType, max: number | string, min: number | string, ...args: string[]): Pipeline;

        zscan(key: KeyType, cursor: number, ...args: any[]): Pipeline;

        zscore(key: KeyType, member: string, callback?: (err: Error, res: number) => void): Pipeline;
    }

    interface RedisMockOptions {
        data?: any;
        keyPrefix?: string;
        lazyConnect?: boolean;
        notifyKeyspaceEvents?: string;
    }

    /*
     * Merging type definitions is the only way we can achieve our goals.
     *
     * 1. We need a declared class.
     * 2. We need a class which implements an interface (IPartialIORedis).
     * 3. We need to avoid the TS compiler error:
     *
     * "This module can only be referenced with ECMAScript imports/exports
     * by turning on the 'esModuleInterop' flag and referencing its default
     * export."
     *
     * Although is possible to turn on the 'esModuleInterop' flag, this could
     * be problematic. It could enter in conflict with importing some
     * CommonJS modules using a sentence like this one:
     *
     * import * as IORedis from 'ioredis';
     *
     * In order to "hack" TS Compiler, we need to merge our definition with a
     * namespace (https://github.com/Microsoft/TypeScript/issues/5073#issuecomment-349478488)
     */

    class PartialIORedis {
        constructor(options?: RedisMockOptions);
    }
    export default PartialIORedis;
}
