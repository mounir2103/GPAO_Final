package com.solution.tp_gpao.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class RegistrationRequest {

    @NotEmpty(message = "FirstName is Mandatory")
    @NotBlank(message = "FirstName is Mandatory")
    private String firstname;
    @NotEmpty(message = "LastName is Mandatory")
    @NotBlank(message = "LastName is Mandatory")
    private String lastname;
    @Email(message = "Email is not formatted")
    @NotEmpty(message = " Email is Mandatory")
    @NotBlank(message = "Email is Mandatory")
    private String email;
    @NotEmpty(message = "Password is Mandatory")
    @NotBlank(message = "Password is Mandatory")
    @Size(min = 7 , message = "Password should be 7 characters minimum")
    private String password;
}
