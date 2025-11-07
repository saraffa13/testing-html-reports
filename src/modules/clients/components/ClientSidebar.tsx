import { ArrowBack } from "@mui/icons-material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CalendarViewMonthOutlinedIcon from "@mui/icons-material/CalendarViewMonthOutlined";
import CalendarViewWeekOutlinedIcon from "@mui/icons-material/CalendarViewWeekOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Avatar, Button, Collapse, Menu, MenuItem, Select } from "@mui/material";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useGetClientSites } from "../apis/hooks/useGetClientSites";
import { useClientContext, type ViewType } from "../context/ClientContext";
import { formatDate, getWeekRange } from "../utils/dateRangeUtils";

interface SideNavItem {
  label: string;
  link?: string;
  submenu?: SideNavItem[];
}

const drawerWidth = 240;

export default function ClientSidebar({ children }: { children: React.ReactNode }) {
  const [statsOpen, setStatsOpen] = useState(true);
  const [dayMenuAnchor, setDayMenuAnchor] = useState<null | HTMLElement>(null);
  const [weekMenuAnchor, setWeekMenuAnchor] = useState<null | HTMLElement>(null);
  const [monthMenuAnchor, setMonthMenuAnchor] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { clientId } = useParams();

  const {
    selectedView,
    setSelectedView,
    selectedSite,
    setSelectedSite,
    currentDate,
    setCurrentDate,
    clientDetails,
    isLoadingClient,
  } = useClientContext();

  const { data: sitesResponse, isLoading: isLoadingSites } = useGetClientSites(clientId || "");
  const sites = sitesResponse?.data || [];

  const toggleStats = () => {
    setStatsOpen(!statsOpen);
  };

  const isActive = (item: SideNavItem): boolean => {
    if (item.link && location.pathname === item.link) {
      return true;
    }
    return false;
  };

  const isSubItemActive = (link: string): boolean => {
    return location.pathname === link;
  };

  const sideNav: SideNavItem[] = [
    {
      label: "PERFORMANCE",
      submenu: [
        {
          label: "Guards Defaults",
          link: `/clients/${clientId}/performance/guards-defaults`,
        },
        {
          label: "Incident Reports",
          link: `/clients/${clientId}/performance/incident-reports`,
        },
        {
          label: "Area officers Tasks",
          link: `/clients/${clientId}/performance/area-officers-tasks`,
        },
        {
          label: "Guards Tasks",
          link: `/clients/${clientId}/performance/guards-tasks`,
        },
      ],
    },
    {
      label: "GUARDS",
      link: `/clients/${clientId}/guards`,
    },
    {
      label: "AREA OFFICERS",
      link: `/clients/${clientId}/area-officers`,
    },
    {
      label: "SITES",
      link: `/clients/${clientId}/sites`,
    },
    {
      label: "PROFILE",
      link: `/clients/${clientId}/profile`,
    },
  ];

  const handleViewChange = (view: ViewType) => {
    setSelectedView(view);
  };

  const handleSiteChange = (event: any) => {
    setSelectedSite(event.target.value);
  };

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
    setDayMenuAnchor(null);
    setWeekMenuAnchor(null);
    setMonthMenuAnchor(null);
  };

  const generateDateOptions = (type: "day" | "week" | "month") => {
    const options = [];
    const today = new Date();

    if (type === "day") {
      const todayFormatted = formatDate(today);
      options.push({
        date: new Date(today),
        label: `${todayFormatted.dayName} ${todayFormatted.day}/${todayFormatted.month}/${todayFormatted.year}`,
      });
      for (let i = 1; i <= 10; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const formatted = formatDate(date);
        options.push({
          date,
          label: `${formatted.dayName} ${formatted.day}/${formatted.month}/${formatted.year}`,
        });
      }
    } else if (type === "week") {
      options.push({
        date: new Date(today),
        label: getWeekRange(today),
      });
      for (let i = 1; i <= 12; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i * 7);
        options.push({
          date,
          label: getWeekRange(date),
        });
      }
    } else if (type === "month") {
      const currentFormatted = formatDate(today);
      options.push({
        date: new Date(today),
        label: `${currentFormatted.monthName} ${currentFormatted.year}`,
      });
      for (let i = 1; i <= 12; i++) {
        const date = new Date(today);
        date.setMonth(today.getMonth() - i);
        const formatted = formatDate(date);
        options.push({
          date,
          label: `${formatted.monthName} ${formatted.year}`,
        });
      }
    }
    return options;
  };

  const currentFormatted = formatDate(currentDate);
  const todayString = `${currentFormatted.dayName} ${currentFormatted.day}/${currentFormatted.month}/${currentFormatted.year}`;
  const weekString = getWeekRange(currentDate);
  const monthString = `${currentFormatted.monthName} ${currentFormatted.year}`;

  const getButtonStyles = (isSelected: boolean) => ({
    bgcolor: isSelected ? "#2A77D5" : "white",
    color: isSelected ? "white" : "#2A77D5",
    border: "1px solid #2A77D5",
    "&:hover": {
      bgcolor: isSelected ? "#1E5A96" : "#E3F2FD",
    },
  });

  const shouldShowViewButtons = location.pathname.includes("/performance/");

  return (
    <Box sx={{ display: "flex", position: "relative", height: "100%" }}>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            position: "relative",
            height: "100%",
            border: 0,
            boxShadow: 0,
          },
        }}
        variant="persistent"
        anchor="left"
        open={true}
      >
        <button className="text-sm mr-auto cursor-pointer" onClick={() => navigate(-1)}>
          <ArrowBack />
        </button>
        <div className="flex flex-col items-center mt-4 gap-1">
          <Avatar
            src={clientDetails?.clientLogo || ""}
            alt={clientDetails?.clientName || ""}
            sx={{ width: "60px", height: "60px" }}
          />
          <span className="font-semibold">
            {isLoadingClient ? "Loading..." : clientDetails?.clientName || "Client Name"}
          </span>

          <span>Client ID: {clientId}</span>
        </div>
        <List sx={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          {sideNav.map((item, index) => {
            const itemIsActive = isActive(item);
            return (
              <div key={index} style={{ marginRight: itemIsActive ? 0 : 16 }}>
                <ListItem
                  disablePadding
                  sx={{
                    display: "block",
                  }}
                >
                  <ListItemButton
                    onClick={item.submenu ? toggleStats : () => navigate(item.link!)}
                    sx={{
                      padding: 0,
                      bgcolor: "#F7F7F7",
                      ...(itemIsActive
                        ? {
                            borderTopLeftRadius: "8px",
                            borderBottomLeftRadius: "8px",
                            color: "#ffffff",
                          }
                        : {
                            borderRadius: "8px",
                          }),
                      p: 1,
                      pr: 2,
                    }}
                  >
                    <ListItemText
                      primary={item.label}
                      slotProps={{
                        primary: {
                          bgcolor: itemIsActive ? "#2A77D5" : "transparent",
                          px: 2,
                          py: 1,
                          borderRadius: "8px",
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                {item.submenu && (
                  <Collapse in={statsOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ pl: 4, bgcolor: "#F7F7F7" }}>
                      {item.submenu.map((subItem, subIndex) => {
                        const subItemIsActive = isSubItemActive(subItem.link!);
                        return (
                          <div key={subIndex} style={{ marginRight: subItemIsActive ? 0 : 16 }}>
                            <ListItem disablePadding sx={{ display: "block" }}>
                              <ListItemButton
                                onClick={() => navigate(subItem.link!)}
                                sx={{
                                  padding: 0,
                                  bgcolor: "transparent",
                                  ...(subItemIsActive
                                    ? {
                                        borderTopLeftRadius: "8px",
                                        borderBottomLeftRadius: "8px",
                                        color: "#ffffff",
                                      }
                                    : {
                                        borderRadius: "8px",
                                      }),
                                  p: 1,
                                  pr: 2,
                                }}
                              >
                                <ListItemText
                                  primary={`\u2022 ${subItem.label}`}
                                  slotProps={{
                                    primary: {
                                      whiteSpace: "nowrap",
                                      bgcolor: subItemIsActive ? "#2A77D5" : "transparent",
                                      px: 2,
                                      py: 1,
                                      borderRadius: "8px",
                                    },
                                  }}
                                />
                              </ListItemButton>
                            </ListItem>
                          </div>
                        );
                      })}
                    </List>
                  </Collapse>
                )}
              </div>
            );
          })}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "#F7F7F7",
          height: "100%",
          overflow: "auto",
          p: 2,
          borderRadius: "12px",
        }}
      >
        {shouldShowViewButtons && (
          <div className="inline-flex justify-between w-full">
            <Button variant="contained" size="small" disabled={isLoadingSites}>
              <HomeWorkOutlinedIcon sx={{ mr: 1 }} />
              <Select
                value={selectedSite}
                onChange={handleSiteChange}
                size="small"
                sx={{
                  minWidth: 180,
                  background: "transparent",
                  border: "none",
                  "& .MuiSelect-icon": { color: "white" },
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
                disableUnderline
                displayEmpty
              >
                <MenuItem value="ALL SITES">ALL SITES</MenuItem>
                {sites.map((site: any) => (
                  <MenuItem key={site.id} value={site.id}>
                    {site.siteName}
                  </MenuItem>
                ))}
              </Select>
              <KeyboardArrowDownIcon sx={{ ml: 1 }} />
            </Button>
            <div className="flex flex-row gap-4">
              <Button
                variant="outlined"
                size="small"
                sx={getButtonStyles(selectedView === "day")}
                onClick={(event) => {
                  handleViewChange("day");
                  setDayMenuAnchor(event.currentTarget);
                }}
                endIcon={<KeyboardArrowDownIcon />}
              >
                <EventOutlinedIcon sx={{ mr: 1 }} />
                {selectedView === "day" ? `DAY | ${todayString}` : "DAY"}
              </Button>
              <Menu anchorEl={dayMenuAnchor} open={Boolean(dayMenuAnchor)} onClose={() => setDayMenuAnchor(null)}>
                {generateDateOptions("day").map((option, index) => (
                  <MenuItem key={index} onClick={() => handleDateSelect(option.date)}>
                    {option.label}
                  </MenuItem>
                ))}
              </Menu>
              <Button
                variant="outlined"
                size="small"
                sx={getButtonStyles(selectedView === "week")}
                onClick={(event) => {
                  handleViewChange("week");
                  setWeekMenuAnchor(event.currentTarget);
                }}
                endIcon={<KeyboardArrowDownIcon />}
              >
                <CalendarViewWeekOutlinedIcon sx={{ mr: 1 }} />
                {selectedView === "week" ? `WEEK | ${weekString}` : "WEEK"}
              </Button>
              <Menu anchorEl={weekMenuAnchor} open={Boolean(weekMenuAnchor)} onClose={() => setWeekMenuAnchor(null)}>
                {generateDateOptions("week").map((option, index) => (
                  <MenuItem key={index} onClick={() => handleDateSelect(option.date)}>
                    {option.label}
                  </MenuItem>
                ))}
              </Menu>
              <Button
                variant="outlined"
                size="small"
                sx={getButtonStyles(selectedView === "month")}
                onClick={(event) => {
                  handleViewChange("month");
                  setMonthMenuAnchor(event.currentTarget);
                }}
                endIcon={<KeyboardArrowDownIcon />}
              >
                <CalendarViewMonthOutlinedIcon sx={{ mr: 1 }} />
                {selectedView === "month" ? `MONTH | ${monthString}` : "MONTH"}
              </Button>
              <Menu anchorEl={monthMenuAnchor} open={Boolean(monthMenuAnchor)} onClose={() => setMonthMenuAnchor(null)}>
                {generateDateOptions("month").map((option, index) => (
                  <MenuItem key={index} onClick={() => handleDateSelect(option.date)}>
                    {option.label}
                  </MenuItem>
                ))}
              </Menu>
              <Button
                variant="outlined"
                size="small"
                sx={getButtonStyles(selectedView === "custom")}
                onClick={() => handleViewChange("custom")}
              >
                <CalendarMonthOutlinedIcon sx={{ mr: 1 }} />
                CUSTOM
              </Button>
            </div>
          </div>
        )}
        {children}
      </Box>
    </Box>
  );
}
