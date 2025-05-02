package com.solution.tp_gpao.admin;

import com.solution.tp_gpao.commonEntity.PageResponse;
import com.solution.tp_gpao.roles.RoleRepository;
import com.solution.tp_gpao.users.User;
import com.solution.tp_gpao.users.UserMappers;
import com.solution.tp_gpao.users.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    public final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final UserMappers userMapper;

    public void registerAdmin(AdminRegistrationRequest request) {
        var adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() -> new IllegalStateException("Admin Role not found or not initialized"));
        var admin = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .createdDate(LocalDateTime.now())
                .accountLocked(false)
                .enabled(true)
                .roles(List.of(adminRole))
                .build();
        userRepository.save(admin);
    }

    public AdminResponse findByAdminIdAndRoleId(Long userId) {
        return userRepository.findByAdminIdAndRoleId(userId)
                .map(userMapper::toAdminResponse)
                .orElseThrow(()-> new EntityNotFoundException("Admin with this ID"+userId+"Not Found"));
    }


    public PageResponse<AdminResponse> findAllAdmins(int page, int size, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());
        Page<User> admins = userRepository.findAllUsersWithAdminRole(pageable);
        List<AdminResponse> AdminResponses = admins.stream()
                .map(userMapper::toAdminResponse)
                .toList();
        return new PageResponse<>(
                AdminResponses,
                admins.getNumber(),
                admins.getSize(),
                admins.getTotalElements(),
                admins.getTotalPages(),
                admins.isFirst(),
                admins.isLast()
        );
    }

    public void deleteAdminById(Long adminId) {
        var admin = userRepository.findById(adminId)
                .orElseThrow(()-> new EntityNotFoundException("Admin with this ID"+adminId+"Not Found"));
        userRepository.delete(admin);
    }
}
