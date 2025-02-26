import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import UpdatePerson from './Person/UpdatePerson';
import DirectionsList from './Directions/DirectionsList';
import ContactList from './Contacts/ContactsList';
import IncomeList from './Incomes/IncomeList';
import FamilyList from './Family/FamilyList';
import {personModel} from '../../app/models/persons'

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

interface TableUpdateDataProps {
    person: personModel;
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
        <Box sx={{ p: 3 }}>
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

export default function TableUpdateData({ person, loadAccess }: TableUpdateDataProps) {
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
        <UpdatePerson person={person} loadAccess={loadAccess} />
      </TabPanel>
      <TabPanel value={value} index={1} dir={theme.direction}>
        <DirectionsList personId={person.id_persona}></DirectionsList>
      </TabPanel>
      <TabPanel value={value} index={2} dir={theme.direction}>
        <ContactList personId={person.id_persona}></ContactList>
      </TabPanel>
      <TabPanel value={value} index={3} dir={theme.direction}>
        <IncomeList personId={person.id_persona}></IncomeList>
      </TabPanel>
      <TabPanel value={value} index={4} dir={theme.direction}>
        <FamilyList personId={person.id_persona}></FamilyList>
      </TabPanel>
    </Box>
  );
}