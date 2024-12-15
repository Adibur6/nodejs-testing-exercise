import { expect } from "chai";
import sinon, { SinonStub } from "sinon";
import request from "supertest";
import app from "../src/app";
import User from "../src/models";

describe("GET /users", () => {
  let findStub: SinonStub;

  beforeEach(() => {
    findStub = sinon.stub(User, "find");
  });

  afterEach(() => {
    findStub.restore();
  });

  it("should return a list of users and respond with status 200", async () => {
    const mockUsers = [
      { name: "John Doe", email: "john@example.com", age: 25 },
      { name: "Jane Smith", email: "jane@example.com", age: 30 },
    ];

    findStub.resolves(mockUsers);

    const response = await request(app).get("/users").expect(200);

    expect(response.body).to.be.an("array").that.has.lengthOf(2);
    expect(response.body[0]).to.include({
      name: "John Doe",
      email: "john@example.com",
      age: 25,
    });
    expect(response.body[1]).to.include({
      name: "Jane Smith",
      email: "jane@example.com",
      age: 30,
    });

    sinon.assert.calledOnce(findStub);
  });

  it("should respond with status 500 if there is a server error", async () => {
    findStub.rejects(new Error("Database error"));

    const response = await request(app).get("/users").expect(500);

    expect(response.body).to.have.property("error", "Database error");

    sinon.assert.calledOnce(findStub);
  });
});

describe("GET /user/:id", () => {
  let findByIdStub: SinonStub;

  beforeEach(() => {
    findByIdStub = sinon.stub(User, "findById");
  });

  afterEach(() => {
    findByIdStub.restore();
  });

  it("should return a user and respond with status 200 when user is found", async () => {
    const mockUser = {
      _id: "12345",
      name: "John Doe",
      email: "john@example.com",
      age: 25,
    };

    findByIdStub.resolves(mockUser);

    const response = await request(app).get("/users/12345").expect(200);

    expect(response.body).to.be.an("object");
    expect(response.body).to.deep.include(mockUser);
  });

  it("should respond with status 404 when user is not found", async () => {
    findByIdStub.resolves(null);

    const response = await request(app).get("/users/12345").expect(404);

    expect(response.body).to.have.property("error", "User not found");
  });

  it("should respond with status 500 when there is a server error", async () => {
    findByIdStub.rejects(new Error("Database error"));

    const response = await request(app).get("/users/12345").expect(500);

    expect(response.body).to.have.property("error", "Database error");
  });
});

describe("POST /users", () => {
  let saveStub: SinonStub;

  beforeEach(() => {
    saveStub = sinon.stub(User.prototype, "save");
  });

  afterEach(() => {
    saveStub.restore();
  });

  it("should create a new user and respond with status 201 when all fields are valid", async () => {
    const newUser = { name: "John Doe", email: "john@example.com" };

    saveStub.resolves(newUser);

    const response = await request(app)
      .post("/users")
      .send(newUser)
      .expect(201);

    expect(response.body).to.be.an("object");
    expect(response.body).to.have.property("name", "John Doe");
    expect(response.body).to.have.property("email", "john@example.com");
  });

  it("should respond with status 400 when name or email is missing", async () => {
    const invalidUser = { name: "John Doe" };

    const response = await request(app)
      .post("/users")
      .send(invalidUser)
      .expect(400);

    expect(response.body).to.have.property(
      "error",
      "Name and email are required"
    );
  });

  it("should respond with status 500 when there is a server error", async () => {
    const newUser = { name: "John Doe", email: "john@example.com" };

    saveStub.rejects(new Error("Database error"));

    const response = await request(app)
      .post("/users")
      .send(newUser)
      .expect(500);

    expect(response.body).to.have.property("error", "Database error");
  });
});

describe("PUT /users/:id", () => {
  let findByIdAndUpdateStub: SinonStub;

  beforeEach(() => {
    findByIdAndUpdateStub = sinon.stub(User, "findByIdAndUpdate");
  });

  afterEach(() => {
    findByIdAndUpdateStub.restore();
  });

  it("should update the user and respond with status 200 when all fields are valid", async () => {
    const updatedUser = { name: "John Doe", email: "john@example.com" };
    const mockUpdatedUser = { _id: "12345", ...updatedUser };

    findByIdAndUpdateStub.resolves(mockUpdatedUser);

    const response = await request(app)
      .put("/users/12345")
      .send(updatedUser)
      .expect(200);

    expect(response.body).to.be.an("object");
    expect(response.body).to.have.property("name", "John Doe");
    expect(response.body).to.have.property("email", "john@example.com");
  });

  it("should respond with status 400 when name or email is missing", async () => {
    const invalidUser = { name: "John Doe" };

    const response = await request(app)
      .put("/users/12345")
      .send(invalidUser)
      .expect(400);

    expect(response.body).to.have.property(
      "error",
      "Name and email are required"
    );
  });

  it("should respond with status 404 when user is not found", async () => {
    const updatedUser = { name: "John Doe", email: "john@example.com" };

    findByIdAndUpdateStub.resolves(null);

    const response = await request(app)
      .put("/users/12345")
      .send(updatedUser)
      .expect(404);

    expect(response.body).to.have.property("error", "User not found");
  });

  it("should respond with status 500 when there is a server error", async () => {
    const updatedUser = { name: "John Doe", email: "john@example.com" };

    findByIdAndUpdateStub.rejects(new Error("Database error"));

    const response = await request(app)
      .put("/users/12345")
      .send(updatedUser)
      .expect(500);

    expect(response.body).to.have.property("error", "Database error");
  });
});

describe("DELETE /users/:id", () => {
  let findByIdAndDeleteStub: SinonStub;

  beforeEach(() => {
    findByIdAndDeleteStub = sinon.stub(User, "findByIdAndDelete");
  });

  afterEach(() => {
    findByIdAndDeleteStub.restore();
  });

  it("should delete the user and respond with status 204 when the user exists", async () => {
    const mockDeletedUser = {
      _id: "12345",
      name: "John Doe",
      email: "john@example.com",
    };

    findByIdAndDeleteStub.resolves(mockDeletedUser);

    const response = await request(app).delete("/users/12345").expect(204);

    expect(response.body).to.be.empty;
  });

  it("should respond with status 404 when user is not found", async () => {
    findByIdAndDeleteStub.resolves(null);

    const response = await request(app).delete("/users/12345").expect(404);

    expect(response.body).to.have.property("error", "User not found");
  });

  it("should respond with status 500 when there is a server error", async () => {
    findByIdAndDeleteStub.rejects(new Error("Database error"));

    const response = await request(app).delete("/users/12345").expect(500);

    expect(response.body).to.have.property("error", "Database error");
  });
});
