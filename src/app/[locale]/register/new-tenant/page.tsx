import Layout from "@/components/layout/Layout";
import NewTenant from "@/components/register/NewTenant";

const NewTenantRegistrationPage = () => {
  return (
    <Layout showBreadcrumbs={false}>
      <NewTenant />
    </Layout>
  );
};

export default NewTenantRegistrationPage; 