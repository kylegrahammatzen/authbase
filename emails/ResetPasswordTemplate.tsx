import {
  Body,
  Container,
  Html,
  Img,
  Preview,
  Text,
  Link,
  Button,
} from "@react-email/components";

interface ResetPasswordTemplateProps {
  resetLink: string;
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
  buttonStyle: {
    display: "block",
    padding: "8px",
    color: "#ffffff",
    backgroundColor: "#3B82F6",
    borderRadius: "0.375rem",
    textDecoration: "none",
  },
  logo: {
    width: 45,
    height: 45,
    margin: "0 auto",
  },
};

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
            Someone recently requested a password change for your ExampleDomain
            account. If this was you, you can set a new password here:
          </Text>
          <Button
            href={
              "http://localhost:3000/update-password?token=" + props.resetLink
            }
            style={styles.buttonStyle}
          >
            Reset password
          </Button>
          <Text style={styles.text}>
            If you don't want to change your password or didn't request this,
            just ignore and delete this message.
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
