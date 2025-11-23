# if 3


다음 프로그램을 실행시켰을 때, "true"를 출력하는 길이가 N인 문자열a, b를 찾는 프로그램을 작성하시오.import java.util.*;

public class Main {
    public static void main(String args[]) {
        Scanner sc = new Scanner(System.in);
        String a = sc.next();
        String b = sc.next();
        if (!a.equals(b) && a.hashCode() == b.hashCode()) {
            System.out.println("true");
        } else {
            System.out.println("false");
        }
    }
}실행 환경은 BOJ 채점 서버의 Java 실행 환경과 같다.