package com.solution.tp_gpao;

import com.solution.tp_gpao.roles.Role;
import com.solution.tp_gpao.roles.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;


@SpringBootApplication
@EnableAsync
@EnableJpaAuditing
public class TpGpaoApplication {

    public static void main(String[] args) {
        SpringApplication.run(TpGpaoApplication.class, args);
    }



    @Bean
    public CommandLineRunner runner(RoleRepository roleRepository) {
        return args -> {
            if(roleRepository.findByName("USER").isEmpty()){
                roleRepository.save(Role.builder().name("USER").build());
            }
        };
    }

}
