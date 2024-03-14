import {
  Body,
  Container,
  Html,
  Img,
  Preview,
  Text,
  Link,
} from "@react-email/components";
interface ResetPasswordTemplateProps {
  resetLink: string;
  secretCode: string;
}

const styles = {
  main: {
    backgroundColor: "#ffffff",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
  },
  container: {
    margin: "0 auto",
    padding: "20px 0 48px",
  },
  text: {
    fontSize: "16px",
    color: "#000000",
  },
  textHeader: {
    fontWeight: "bold",
  },
  linkStyle: {
    color: "#2563EB",
    textDecoration: "underline",
  },
  codeContainer: {
    color: "#000000",
    outline: "none",
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    border: "1px solid #D1D5DB",
    fontSize: "18px",
    fontWeight: "bold",
    margin: "0 4px",
    textAlign: "center" as const,
    lineHeight: "36px",
  },
  logo: {
    width: 45,
    height: 45,
    margin: "0 auto",
  },
};

type CodeContainerProps = {
  char: string;
};

const CodeContainer = ({ char }: CodeContainerProps) => (
  <div style={styles.codeContainer}>{char}</div>
);

export default function ResetPasswordTemplate(
  props: ResetPasswordTemplateProps
) {
  return (
    <Html>
      <Preview>Reset your password at ExampleDomain</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Img
            src="https://tailwindui.com/img/logos/mark.svg?color=blue&shade=600"
            alt="ExampleDomain Logo"
            style={styles.logo}
          />
          <Text style={{ ...styles.text, ...styles.textHeader }}>
            Password Reset Request
          </Text>
          <Text style={styles.text}>
            You're receiving this email because we received a password reset
            request for your account. You can either enter the code provided
            below at our reset page or click the link to reset your password.
          </Text>
          <div style={{ display: "flex" }}>
            {props.secretCode.split("").map((char, i) => (
              <CodeContainer key={i} char={char} />
            ))}
          </div>
          <Text style={styles.text}>
            <Link href={props.resetLink} style={styles.linkStyle}>
              Reset Password
            </Link>
          </Text>
          <Text style={styles.text}>
            If you did not request a password reset, no further action is
            required.
          </Text>
          <Text style={styles.text}>
            Sincerely,
            <br />
            Kyle from{" "}
            <Link href="https://exampledomain.com">ExampleDomain</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
