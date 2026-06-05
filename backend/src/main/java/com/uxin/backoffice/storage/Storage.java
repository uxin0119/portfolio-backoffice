package com.uxin.backoffice.storage;

/** 오브젝트 저장소 추상화 (Supabase Storage 또는 로컬 파일시스템 등으로 교체 가능). */
public interface Storage {

  boolean isEnabled();

  /** path 위치에 바이트 저장 후 공개 URL 반환. */
  String upload(String path, byte[] bytes, String contentType);

  /** 주어진 URL이 이 저장소가 만든 URL인지 (이미 저장됨 판별용). */
  boolean owns(String url);
}
