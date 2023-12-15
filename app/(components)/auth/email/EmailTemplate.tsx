import {
  Body,
  Container,
  Html,
  Img,
  Preview,
  Text,
  Link,
} from "@react-email/components";

interface EmailTemplateProps {
  secretCode: string;
}

export const AuthEmail = ({ secretCode }: EmailTemplateProps) => (
  <Html>
    <Preview>
      The platform that helps you track bans, warnings, and other related
      information.
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://tailwindui.com/img/logos/mark.svg?color=red&shade=600"
          alt="ExampleDomain Logo"
          style={logo}
        />
        <Text style={paragraphHeader}>Welcome to ExampleDomain!</Text>
        <Text style={paragraph}>
          This is template text. Please use the code below to verify your email
          address.
        </Text>
        <div style={{ display: "flex" }}>
          {secretCode.split("").map((char, i) => (
            <div key={i} style={codeContainer}>
              {char}
            </div>
          ))}
        </div>
        <Text style={paragraph}>
          Sincerely,
          <br />
          Kyle from <Link href="https://exampledomain.com">ExampleDomain</Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

export default AuthEmail;

const logo = {
  width: 80,
  height: 80,
  margin: "0 auto",
};

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
};

const paragraphHeader = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#000000",
};

const paragraph = {
  fontSize: "16px",
  color: "#000000",
};

const codeContainer = {
  color: "#000000",
  outline: "none",
  width: "36px", // w-14
  height: "36px", // h-14
  borderRadius: "8px", // rounded-md
  border: "1px solid #D1D5DB", // border-gray-300
  fontSize: "18px", // text-lg
  fontWeight: "bold", // font-bold

  margin: "0 4px", // space-x-1

  textAlign: "center", // text-center
  lineHeight: "36px", // h-14
};
