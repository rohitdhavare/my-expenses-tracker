package com.expenses_tracker.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.expenses_tracker.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Finds a user by their username.
     * Spring Data JPA automatically creates the query for this method based on its name.
     * @param username the username to search for.
     * @return an Optional containing the User if found, otherwise an empty Optional.
     */
   @Query("SELECT u FROM User u JOIN FETCH u.roles WHERE u.username = :username")
Optional<User> findByUsername(@Param("username") String username);

    /**
     * Checks if a user exists by their username.
     */
    boolean existsByUsername(String username);

    

}
