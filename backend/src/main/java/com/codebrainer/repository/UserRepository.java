package com.codebrainer.repository;

import com.codebrainer.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * User 엔티티에 대한 데이터베이스 접근 인터페이스
 * Spring Data JPA가 자동으로 구현체를 생성
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 이메일로 사용자 조회
     * @param email 사용자 이메일
     * @return Optional<User>
     */
    Optional<User> findByEmail(String email);

    /**
     * 이메일 중복 체크
     * @param email 사용자 이메일
     * @return 존재 여부
     */
    boolean existsByEmail(String email);

    /**
     * 아이디로 사용자 조회
     * @param username 사용자 아이디
     * @return Optional<User>
     */
    Optional<User> findByUsername(String username);

    /**
     * 아이디 중복 체크
     * @param username 사용자 아이디
     * @return 존재 여부
     */
    boolean existsByUsername(String username);
}

