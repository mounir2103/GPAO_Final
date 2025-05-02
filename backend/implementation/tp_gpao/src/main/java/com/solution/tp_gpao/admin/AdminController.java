package com.solution.tp_gpao.admin;

import com.solution.tp_gpao.commonEntity.PageResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Tag(name = "Admin")
public class AdminController {

    public final AdminService service;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/register-admin")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ResponseEntity<?>registerAdmin(
            @Valid @RequestBody AdminRegistrationRequest request ){
        service.registerAdmin(request );
        return ResponseEntity.accepted().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{admin-id}")
    public ResponseEntity<AdminResponse> findByUserIdAndRoleId(
            @PathVariable("admin-id") Long userId
    ){
        return ResponseEntity.ok(service.findByAdminIdAndRoleId(userId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all-admins")
    public ResponseEntity<PageResponse<AdminResponse>>findAllAdmins(
            @RequestParam(name = "page" ,defaultValue = "0", required = false)int page,
            @RequestParam(name = "size" ,defaultValue = "5", required = false)int size,
            Authentication connectedUser
    ){
        return ResponseEntity.ok(service.findAllAdmins(page,size,connectedUser));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("delete/{admin-id}")
    public ResponseEntity<Void> deleteAdminById(
            @PathVariable("admin-id") Long adminId
    ) {
        service.deleteAdminById(adminId);
        return ResponseEntity.noContent().build();
    }

}
