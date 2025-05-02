package com.solution.tp_gpao.users;

import com.solution.tp_gpao.commonEntity.PageResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserMappers usermapper;

    public UserResponse findUserByIdAndRoleId(Long userId) {
        return userRepository.findByUserIdAndRoleId(userId)
                .map(usermapper::toUserResponse)
                .orElseThrow(()-> new EntityNotFoundException("User with this ID"+userId+"not found"));
    }

    public PageResponse<UserResponse> findAllUser(int page, int size, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());
        Page<User> users = userRepository.findAllUsersWithUserRole(pageable);
        List<UserResponse> userResponses = users.stream()
                .map(usermapper::toUserResponse)
                .toList();
        return new PageResponse<>(
                userResponses,
                users.getNumber(),
                users.getSize(),
                users.getTotalElements(),
                users.getTotalPages(),
                users.isFirst(),
                users.isLast()
        );
    }

    public void deleteUserById(Long userId) {
        var user = userRepository.findById(userId)
                .orElseThrow(()-> new EntityNotFoundException("User with this ID"+userId+"not found"));
        userRepository.delete(user);
    }
}
