package com.taskmanager;

import java.sql.Connection;
import java.sql.DriverManager;

public class DbTest {
    public static void main(String[] args) {
        String[] passwords = {
            "mypassword",
            "postgres",
            "admin",
            "password",
            "1234",
            "123456",
            "root",
            ""
        };

        String url = "jdbc:postgresql://localhost:5432/task_manager_db";
        String user = "postgres";

        System.out.println("Starting DB Connection scan...");
        for (String password : passwords) {
            try {
                System.out.println("Trying password: '" + password + "'...");
                Connection conn = DriverManager.getConnection(url, user, password);
                System.out.println("🟢 SUCCESS! Password is: '" + password + "'");
                conn.close();
                return;
            } catch (Exception e) {
                System.out.println("🔴 Failed: " + e.getMessage());
            }
        }
        System.out.println("All passwords failed.");
    }
}
