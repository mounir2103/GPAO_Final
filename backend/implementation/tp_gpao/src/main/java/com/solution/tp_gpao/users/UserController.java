package com.solution.tp_gpao.users;

import com.solution.tp_gpao.commonEntity.PageResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "User")
public class UserController {

    public final UserService service ;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{user-id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable("user-id") Long userId) {
        return ResponseEntity.ok(service.findUserByIdAndRoleId(userId));
    }
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all-users")
    public ResponseEntity<PageResponse<UserResponse>>findAllUser(
            @RequestParam(name = "page" ,defaultValue = "0", required = false)int page,
            @RequestParam(name = "size" ,defaultValue = "5", required = false)int size,
            Authentication connectedUser
    ){
        return ResponseEntity.ok(service.findAllUser(page,size,connectedUser));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("delete/{user-id}")
    public ResponseEntity<Void> deleteAdminById(
            @PathVariable("user-id") Long userId
    ) {
        service.deleteUserById(userId);
        return ResponseEntity.noContent().build();
    }

}
