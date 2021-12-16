import { GetServerSideProps } from "next";
import React from "react";
import { useRouter } from "next/router";

import { TicketWrapper } from "../../components/Ticket/TicketWrapper";
import { TrackingWrapper } from "../../components/Ticket/TrackingWrapper";

import { deleteTicketRequest, sellTicketRequest, toPrivateTicketRequest } from "../../api/ticket/ticket.api";
import { withAuthUser } from "../../lib/withAuthUser";
import { fetchUsersTickets } from "../../lib/fetchUsersTickets";

import { AuthUser, TabOptions, Ticket } from "../../interface";

interface TicketsProps {
  tickets: Ticket[];
  user?: AuthUser;
}

const Tickets: React.FC<TicketsProps> = ({ tickets, user }) => {
  const router = useRouter();
  const [currentTab, setCurrentTab] = React.useState<TabOptions>("tickets");

  const deleteTicketHandler = async (id: string) => {
    await deleteTicketRequest(id);
    router.replace("/tickets");
  };

  const sellTicketHandler = async (id: string) => {
    await sellTicketRequest(id);
    router.replace("/tickets");
  };

  const cancelSellingTicketHandler = async (id: string) => {
    await toPrivateTicketRequest(id);
    router.replace("/tickets", "/tickets/tracking");
  };

  const navigateToTickets = () => {
    setCurrentTab("tickets");
    router.replace("/tickets");
  };

  const navigateToTracking = () => {
    setCurrentTab("tracking");
    router.replace("/tickets", "/tickets/tracking");
  };

  return (
    <div>
      {!user ? (
        <>
          <div>
            <button onClick={navigateToTickets}>Tickets</button>
            <button onClick={navigateToTracking}>Tracking</button>
          </div>
          {currentTab === "tickets" ? (
            <TicketWrapper tickets={tickets} deleteTicketHandler={deleteTicketHandler} sellTicketHandler={sellTicketHandler} />
          ) : (
            <TrackingWrapper tickets={tickets} cancelSellingTicketHandler={cancelSellingTicketHandler} />
          )}
        </>
      ) : (
        <>
          <h2>No data, please login</h2>
          {tickets.map((t) => (
            <div key={t.id}>
              Destination: {t.destination.destination}
              <div>Status: {t.status}</div>
              <button onClick={() => deleteTicketHandler(t.id)}>delete</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
};
export default Tickets;

export const getServerSideProps: GetServerSideProps = withAuthUser(fetchUsersTickets());
