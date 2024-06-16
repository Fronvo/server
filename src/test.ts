import { v4 } from "uuid";
import server from "./api";
import supertest from "supertest";
import defaults from "superagent-defaults";
import { getNormalisedV4 } from "./utils";

const request = defaults(supertest(server));

const username = `${v4().substring(0, 30)}`;
const profileId = `${getNormalisedV4().substring(0, 30)}`;
const email = `${v4()}@gmail.com`;
const password = v4();
let accessToken = "";
let refreshToken = "";

describe("Authentication", () => {
  it("Register", async () => {
    const res = await request.post("/register").send({
      username,
      profileId,
      email,
      password,
    });

    expect(res.status).toEqual(200);
    expect(res.type).toEqual(expect.stringContaining("json"));
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
    expect(res.body).toHaveProperty("id");
  });

  it("Login", async () => {
    const res = await request.post("/login").send({
      email,
      password,
    });

    expect(res.status).toEqual(200);
    expect(res.type).toEqual(expect.stringContaining("json"));
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
    expect(res.body).toHaveProperty("id");

    accessToken = `Bearer ${res.body.accessToken}`;
    refreshToken = `Bearer ${res.body.refreshToken}`;

    // For the accessToken test below
    request.set({
      Authorization: refreshToken,
    });
  });

  it("Regenerate access token", async () => {
    const res = await request.get("/accessToken");

    expect(res.status).toEqual(200);
    expect(res.type).toEqual(expect.stringContaining("json"));
    expect(res.body).toHaveProperty("accessToken");

    accessToken = `Bearer ${res.body.accessToken}`;

    request.set({
      Authorization: accessToken,
    });
  });
});

describe("Profiles", () => {
  it("Fetch self data", async () => {
    const res = await request.get("/me");

    expect(res.status).toEqual(200);
    expect(res.type).toEqual(expect.stringContaining("json"));

    const profileData = res.body.profileData;

    expect(profileData).toBeDefined();

    expect(profileData.created_at).toBeDefined();
  });

  it("Update self status", async () => {
    const res = await request.post("/me/updateStatus").send({
      status: 1,
    });

    expect(res.status).toEqual(200);
    expect(res.type).toEqual(expect.stringContaining("json"));
    expect(res.body).toHaveProperty("status");
  });

  it("Update self note", async () => {
    const res = await request.post("/me/updateNote").send({
      note: "Example note",
    });

    expect(res.status).toEqual(200);
    expect(res.type).toEqual(expect.stringContaining("json"));
    expect(res.body).toHaveProperty("note");
  });
});

describe("Other", () => {
  it("Get version", async () => {
    const res = await request.get("/version");

    expect(res.status).toEqual(200);
  });
});

describe("Finalise", () => {
  it("Terminate account", async () => {
    const res = await request.delete("/login").send({
      password,
    });

    expect(res.status).toEqual(200);
    expect(res.type).toEqual(expect.stringContaining("json"));
    expect(res.body).toHaveProperty("success");
  });
});
