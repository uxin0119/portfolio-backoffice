package com.uxin.backoffice.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** storage.type(supabase|local)에 따라 활성 Storage 빈 선택. */
@Configuration
public class StorageConfig {

  @Bean
  Storage storage(
      @Value("${storage.type:supabase}") String type,
      @Value("${supabase.url:}") String supabaseUrl,
      @Value("${supabase.service-key:}") String supabaseKey,
      @Value("${supabase.bucket:product-images}") String bucket,
      @Value("${storage.local.dir:}") String localDir,
      @Value("${storage.local.base-url:}") String localBaseUrl) {
    if ("local".equalsIgnoreCase(type)) {
      return new LocalStorage(localDir, localBaseUrl);
    }
    return new SupabaseStorage(supabaseUrl, supabaseKey, bucket);
  }
}
