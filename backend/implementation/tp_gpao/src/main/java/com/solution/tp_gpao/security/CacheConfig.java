package com.solution.tp_gpao.security;

import org.springframework.boot.autoconfigure.cache.CacheManagerCustomizers;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Collections;

@Configuration
public class CacheConfig {

    @Bean
    public CacheManagerCustomizers cacheManagerCustomizers() {
        return new CacheManagerCustomizers(Collections.emptyList());
    }
}
