package com.uxin.backoffice.commoncode;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommonCodeRepository extends JpaRepository<CommonCode, Long> {

  List<CommonCode> findAllByOrderByGroupCodeAscSortOrderAscIdAsc();

  boolean existsByGroupCodeAndCode(String groupCode, String code);
}
