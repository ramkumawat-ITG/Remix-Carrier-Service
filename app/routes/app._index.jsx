import { useEffect, useState } from "react";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
} from "@shopify/polaris";

export default function Index() {
  const saveFetcher = useFetcher();
  const [customerId, setCustomerId] = useState(null);
  const [customer, setCustomer] = useState();
  const [error, setError] = useState("");
  const fetchCustomer = async () => {
    setError("");
    try {
      const res = await fetch(`/api/customer/customer-details`, {
        method: "POST",
        body: JSON.stringify({
          customerId,
        }), headers: { "Content-Type": "application/json" }
      })
      const data = await res.json();
      setCustomer(data?.result?.data?.customer)
      if (res.ok) {

        const customer = data?.result?.data?.customer;
        const formData = new FormData();
        formData.append("firstName", customer?.firstName || "");
        formData.append("lastName", customer?.lastName || "");
        formData.append("email", customer?.email || "");
        formData.append("customerId", customer?.id || "");
        formData.append("addresses", JSON.stringify(customer?.addresses || []));
        saveFetcher.submit(formData, {
          method: "POST",
          action: "/api/db-save/data",
        });

      } else {
        setError(data.error || "Not found");
      }

    } catch (e) {
      setError("API error");
    }
  };

  return (
    <Page>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="400">
                  <Box>
                    <Text variant="headingMd">Customer Details Finder</Text>
                    {/* <ProgressBar onClick={fetchCustomer} /> */}
                    <InlineStack gap="200">
                      <input
                        type="number"
                        value={customerId}
                        min={1}
                        onChange={e => setCustomerId(e.target.value)}
                        style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                      />
                      <Button onClick={fetchCustomer}>Find Customer</Button>
                    </InlineStack>
                    {error && <Text color="critical">{error}</Text>}
                    {customer && (
                      <Box paddingBlockStart="400">
                        <Text variant="bodyMd">
                          <b>ID:</b> {customer?.id}<br />
                          <b>Name:</b> {customer?.firstName} {customer?.lastName}<br />
                          <b>Email:</b> {customer.email}<br />
                        </Text>
                      </Box>
                    )}
                    {customer?.addresses && customer?.addresses.length > 0 && (
                      <BlockStack gap="200">
                        <Text variant="headingSm">Addresses:</Text>
                        <List>
                          {customer?.addresses.map((addr, index) => (
                            <List.Item key={index}>
                              {addr.city}, {addr.province}, {addr.country}
                            </List.Item>
                          ))}
                        </List>
                      </BlockStack>
                    )}
                  </Box>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}




// const ProgressBar = () => {
//   const styles = {
//     container: {
//       width: "100%",
//       height: "30px",
//       backgroundColor: "#e0e0e0",
//       borderRadius: "8px",
//       overflow: "hidden",
//       position: "relative",
//       marginTop: "20px"
//     },
//     bar: {
//       height: "100%",
//       backgroundColor: "#4caf50",
//       transition: "width 0.1s linear"
//     },
//     label: {
//       position: "absolute",
//       top: 0,
//       left: "50%",
//       transform: "translateX(-50%)",
//       color: "#000",
//       fontWeight: "bold",
//       lineHeight: "30px"
//     }
//   };
//   const [progress, setProgress] = useState(0); // start from 0

//   useEffect(() => {
//     const duration = 10 * 1000; // 10 seconds
//     const interval = 100; // update every 100ms
//     const steps = duration / interval; // total steps = 100
//     const increment = 100 / steps; // how much to add per step

//     const timer = setInterval(() => {
//       setProgress(prev => {
//         if (prev >= 100) {
//           clearInterval(timer);
//           return 100;
//         }
//         return prev + increment;
//       });
//     }, interval);

//     return () => clearInterval(timer); // cleanup
//   }, []);

//   return (
//     <div style={styles.container}>
//       <div style={{ ...styles.bar, width: `${progress}%` }} />
//       <div style={styles.label}>{Math.round(progress)}%</div>
//     </div>
//   );
// };



