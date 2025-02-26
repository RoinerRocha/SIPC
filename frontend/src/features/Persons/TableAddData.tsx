import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import RegisterPerson from './Person/RegisterPerson';
import RegisterDirections from './Directions/RegisterDirections';
import RegisterContacts from './Contacts/RegisterContacts';
import RegisterIncomes from './Incomes/RegisterIncomes';
import RegisterFamilyMember from './Family/RegisterFamilyMember';


interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}
interface TableAddDataProps {
    loadAccess: () => void; // Define el tipo adecuado para el prop
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 4 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

export default function TableAddData({ loadAccess }: TableAddDataProps) {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', width: 1135 }}>
      <AppBar position="static">
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="secondary"
          textColor="inherit"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label="Personas" {...a11yProps(0)} />
          <Tab label="Direcciones" {...a11yProps(1)} />
          <Tab label="Contactos" {...a11yProps(2)} />
          <Tab label="Ingresos" {...a11yProps(3)} />
          <Tab label="Grupo Familiar" {...a11yProps(4)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0} dir={theme.direction}>
        <RegisterPerson loadAccess={loadAccess}></RegisterPerson>
      </TabPanel>
      <TabPanel value={value} index={1} dir={theme.direction}>
        <RegisterDirections loadAccess={loadAccess} ></RegisterDirections>
      </TabPanel>
      <TabPanel value={value} index={2} dir={theme.direction}>
        <RegisterContacts loadAccess={loadAccess} ></RegisterContacts>
      </TabPanel>
      <TabPanel value={value} index={3} dir={theme.direction}>
        <RegisterIncomes loadAccess={loadAccess} ></RegisterIncomes>
      </TabPanel>
      <TabPanel value={value} index={4} dir={theme.direction}>
        <RegisterFamilyMember loadAccess={loadAccess} ></RegisterFamilyMember>
      </TabPanel>
    </Box>
  );
}