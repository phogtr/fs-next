import { IncomingMessage, ServerResponse } from "http";
import { GetServerSidePropsContext } from "next";
import axios from "./axios";

const refreshingToken = async (req: IncomingMessage, res: ServerResponse) => {
  const response = await axios.post("/refresh-token", undefined, {
    headers: { cookie: req.headers.cookie },
  });
  const cookies = response.headers["set-cookie"];
  req.headers.cookie = cookies;
  res.setHeader("set-cookie", cookies);
};

const requestAuthUser = async (req: IncomingMessage) => {
  try {
    const { data } = await axios.get("/auth", {
      headers: { cookie: req.headers.cookie },
    });
    const authUser = {
      userId: data,
    };
    return authUser;
  } catch (error) {
    throw error;
  }
};

const getAuthUser = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const authUser = await requestAuthUser(req);
    return authUser;
  } catch (error) {
    if ((error as any)?.response?.status === 401) {
      // accessToken is expired, refreshToken still available
      try {
        await refreshingToken(req, res);
        const authUser = await requestAuthUser(req);
        return authUser;
      } catch (err2) {
        // both cookies are not in the header => undefined error from axios
        console.log(err2);
      }
    }
    return null;
  }
};

export const withAuthUser = (inner: Function) => {
  return async (context: GetServerSidePropsContext) => {
    const { req, res } = context;
    const authUser = await getAuthUser(req, res);

    if (!authUser) {
      return { props: {} };
    }

    return inner ? inner(authUser) : { props: { user: authUser } };
  };
};
