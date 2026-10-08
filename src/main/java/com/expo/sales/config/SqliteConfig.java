package com.expo.sales.config;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

/** SQLite tuning for a small multi-device LAN POS. */
@Component
public class SqliteConfig {
    private final JdbcTemplate jdbc;

    public SqliteConfig(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @PostConstruct
    public void configure() {
        jdbc.execute("PRAGMA foreign_keys = ON");
        jdbc.execute("PRAGMA journal_mode = WAL");
        jdbc.execute("PRAGMA busy_timeout = 10000");
        jdbc.execute("PRAGMA synchronous = NORMAL");
    }
}
