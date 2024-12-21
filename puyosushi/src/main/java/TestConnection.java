import java.sql.Connection;
import java.sql.DriverManager;

public class TestConnection {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/Scruta";
        String user = "postgres";
        String password = "admin";

        try {
            Class.forName("org.postgresql.Driver");
            Connection conn = DriverManager.getConnection(url, user, password);
            System.out.println("PostgreSQLに接続成功！");
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
