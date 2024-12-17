import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/score")
public class ScoreServlet extends HttpServlet {

    // PostgreSQL接続情報
    private static final String URL = "jdbc:postgresql://localhost:5432/Scruta";
    private static final String USER = "postgres";
    private static final String PASSWORD = "admin";

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        int score = Integer.parseInt(request.getParameter("score")); // クライアントから送信されたスコア
        Connection conn = null;
        PreparedStatement pstmt = null;

        try {
            // PostgreSQLドライバをロード
            Class.forName("org.postgresql.Driver");
            conn = DriverManager.getConnection(URL, USER, PASSWORD);

            // テーブルが存在しない場合に作成
            String createTableSQL = "CREATE TABLE IF NOT EXISTS scores ("
                                  + "id SERIAL PRIMARY KEY, "
                                  + "score INTEGER NOT NULL, "
                                  + "recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)";
            pstmt = conn.prepareStatement(createTableSQL);
            pstmt.execute();

            // スコアを挿入
            String insertSQL = "INSERT INTO scores (score) VALUES (?)";
            pstmt = conn.prepareStatement(insertSQL);
            pstmt.setInt(1, score);
            pstmt.executeUpdate();

            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("Score recorded successfully!");

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Error recording score: " + e.getMessage());
        } finally {
            try { if (pstmt != null) pstmt.close(); } catch (SQLException e) { e.printStackTrace(); }
            try { if (conn != null) conn.close(); } catch (SQLException e) { e.printStackTrace(); }
        }
    }
}
