package com.taskmanager.service;

import com.taskmanager.dto.AuthResponse;
import com.taskmanager.dto.RegisterRequest;
import com.taskmanager.model.User;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.security.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check email existence
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Check username existence
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        // Create new User
        User user = new User();
        user.setName(request.getName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);

        // Generate tokens
        String accessToken = tokenProvider.generateAccessToken(savedUser.getId(), savedUser.getEmail());
        String refreshToken = tokenProvider.generateRefreshToken(savedUser.getId(), savedUser.getEmail());

        AuthResponse.UserResponseUser userResponse = new AuthResponse.UserResponseUser(
                savedUser.getId(), savedUser.getName(), savedUser.getUsername(), savedUser.getEmail()
        );

        return new AuthResponse(userResponse, accessToken, refreshToken);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(String loginIdentifier, String password) {
        boolean isEmail = loginIdentifier.contains("@");
        User user;

        if (isEmail) {
            user = userRepository.findByEmail(loginIdentifier)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        } else {
            user = userRepository.findByUsername(loginIdentifier)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException(isEmail ? "Invalid email or password" : "Invalid username or password");
        }

        // Generate tokens
        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = tokenProvider.generateRefreshToken(user.getId(), user.getEmail());

        AuthResponse.UserResponseUser userResponse = new AuthResponse.UserResponseUser(
                user.getId(), user.getName(), user.getUsername(), user.getEmail()
        );

        return new AuthResponse(userResponse, accessToken, refreshToken);
    }

    @Transactional(readOnly = true)
    public AuthResponse refreshToken(String refreshToken) {
        Claims claims = tokenProvider.verifyRefreshToken(refreshToken);
        if (claims == null) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        Integer userId = claims.get("userId", Integer.class);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Generate new tokens
        String newAccessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String newRefreshToken = tokenProvider.generateRefreshToken(user.getId(), user.getEmail());

        // We wrap it in AuthResponse but only accessToken/refreshToken are used
        return new AuthResponse(null, newAccessToken, newRefreshToken);
    }
}
