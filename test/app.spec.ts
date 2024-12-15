import { expect } from "chai";
import sinon, { SinonStub } from "sinon";
import request from "supertest";
import app from "../src/app";
import User from "../src/models";

describe("GET /users", () => {
    let findStub: SinonStub;

    // Setup and cleanup stubs
    beforeEach(() => {
        // Stub the User.find method
        findStub = sinon.stub(User, "find");
    });

    afterEach(() => {
        // Restore the original method
        findStub.restore();
    });

    it("should return a list of users and respond with status 200", async () => {
        // Mock response data
        const mockUsers = [
            { name: "John Doe", email: "john@example.com", age: 25 },
            { name: "Jane Smith", email: "jane@example.com", age: 30 },
        ];

        // Stub User.find to return the mock data
        findStub.resolves(mockUsers);

        // Make the request and assert the response
        const response = await request(app).get("/users").expect(200);

        expect(response.body).to.be.an("array").that.has.lengthOf(2);
        expect(response.body[0]).to.include({ name: "John Doe", email: "john@example.com", age: 25 });
        expect(response.body[1]).to.include({ name: "Jane Smith", email: "jane@example.com", age: 30 });

        // Ensure User.find was called once
        sinon.assert.calledOnce(findStub);
    });

    it("should respond with status 500 if there is a server error", async () => {
        // Stub User.find to throw an error
        findStub.rejects(new Error("Database error"));

        // Make the request and assert the response
        const response = await request(app).get("/users").expect(500);

        expect(response.body).to.have.property("error", "Database error");

        // Ensure User.find was called once
        sinon.assert.calledOnce(findStub);
    });
});

describe("GET /user/:id", () => {
  let findByIdStub:SinonStub;

  // Setup and cleanup stubs
  beforeEach(() => {
    // Stub the `findById` method of the User model
    findByIdStub = sinon.stub(User, "findById");
  });

  afterEach(() => {
    // Restore the original method after each test
    findByIdStub.restore();
  });

  it("should return a user and respond with status 200 when user is found", async () => {
    const mockUser = { _id: "12345", name: "John Doe", email: "john@example.com", age: 25 };

    // Stub `findById` to resolve with a mock user
    findByIdStub.resolves(mockUser);

    const response = await request(app).get("/users/12345").expect(200);

    expect(response.body).to.be.an("object");
    expect(response.body).to.deep.include(mockUser);
  });

  it("should respond with status 404 when user is not found", async () => {
    // Stub `findById` to resolve with null (user not found)
    findByIdStub.resolves(null);

    const response = await request(app).get("/users/12345").expect(404);

    expect(response.body).to.have.property("error", "User not found");
  });

  it("should respond with status 500 when there is a server error", async () => {
    // Stub `findById` to reject with an error
    findByIdStub.rejects(new Error("Database error"));

    const response = await request(app).get("/users/12345").expect(500);

    expect(response.body).to.have.property("error", "Database error");
  });
});

describe("POST /users", () => {
  let saveStub:SinonStub;
  
  // Setup and cleanup stubs
  beforeEach(() => {
    saveStub = sinon.stub(User.prototype, "save");
  });
  
  afterEach(() => {
    // Restore the original save method after each test
    saveStub.restore();
  });
  
  it("should create a new user and respond with status 201 when all fields are valid", async () => {
    const newUser = { name: "John Doe", email: "john@example.com" };
  
    // Stub `save` to resolve with the new user
    saveStub.resolves(newUser);
  
    const response = await request(app).post("/users").send(newUser).expect(201);
  
    expect(response.body).to.be.an("object");
    expect(response.body).to.have.property("name", "John Doe");
    expect(response.body).to.have.property("email", "john@example.com");
  });
  
  it("should respond with status 400 when name or email is missing", async () => {
    const invalidUser = { name: "John Doe" }; // Missing email
  
    const response = await request(app).post("/users").send(invalidUser).expect(400);
  
    expect(response.body).to.have.property("error", "Name and email are required");
  });
  
  it("should respond with status 500 when there is a server error", async () => {
    const newUser = { name: "John Doe", email: "john@example.com" };
  
    // Stub `save` to simulate a server error
    saveStub.rejects(new Error("Database error"));
  
    const response = await request(app).post("/users").send(newUser).expect(500);
  
    expect(response.body).to.have.property("error", "Database error");
  });
  });
  
  
  describe("PUT /users/:id", () => {
    let findByIdAndUpdateStub:SinonStub;
    
    // Setup and cleanup stubs
    beforeEach(() => {
      findByIdAndUpdateStub = sinon.stub(User, "findByIdAndUpdate");
    });
    
    afterEach(() => {
      // Restore the original findByIdAndUpdate method after each test
      findByIdAndUpdateStub.restore();
    });
    
    it("should update the user and respond with status 200 when all fields are valid", async () => {
      const updatedUser = { name: "John Doe", email: "john@example.com" };
      const mockUpdatedUser = { _id: "12345", ...updatedUser };
    
      // Stub `findByIdAndUpdate` to resolve with the updated user
      findByIdAndUpdateStub.resolves(mockUpdatedUser);
    
      const response = await request(app).put("/users/12345").send(updatedUser).expect(200);
    
      expect(response.body).to.be.an("object");
      expect(response.body).to.have.property("name", "John Doe");
      expect(response.body).to.have.property("email", "john@example.com");
    });
    
    it("should respond with status 400 when name or email is missing", async () => {
      const invalidUser = { name: "John Doe" }; // Missing email
    
      const response = await request(app).put("/users/12345").send(invalidUser).expect(400);
    
      expect(response.body).to.have.property("error", "Name and email are required");
    });
    
    it("should respond with status 404 when user is not found", async () => {
      const updatedUser = { name: "John Doe", email: "john@example.com" };
    
      // Stub `findByIdAndUpdate` to resolve with null (user not found)
      findByIdAndUpdateStub.resolves(null);
    
      const response = await request(app).put("/users/12345").send(updatedUser).expect(404);
    
      expect(response.body).to.have.property("error", "User not found");
    });
    
    it("should respond with status 500 when there is a server error", async () => {
      const updatedUser = { name: "John Doe", email: "john@example.com" };
    
      // Stub `findByIdAndUpdate` to simulate a server error
      findByIdAndUpdateStub.rejects(new Error("Database error"));
    
      const response = await request(app).put("/users/12345").send(updatedUser).expect(500);
    
      expect(response.body).to.have.property("error", "Database error");
    });
    });
    
    describe("DELETE /users/:id", () => {
      let findByIdAndDeleteStub:SinonStub;
      
      // Setup and cleanup stubs
      beforeEach(() => {
        findByIdAndDeleteStub = sinon.stub(User, "findByIdAndDelete");
      });
      
      afterEach(() => {
        // Restore the original findByIdAndDelete method after each test
        findByIdAndDeleteStub.restore();
      });
      
      it("should delete the user and respond with status 204 when the user exists", async () => {
        const mockDeletedUser = { _id: "12345", name: "John Doe", email: "john@example.com" };
      
        // Stub `findByIdAndDelete` to resolve with the deleted user
        findByIdAndDeleteStub.resolves(mockDeletedUser);
      
        const response = await request(app).delete("/users/12345").expect(204);
      
        // No content expected with status 204
        expect(response.body).to.be.empty;
      });
      
      it("should respond with status 404 when user is not found", async () => {
        // Stub `findByIdAndDelete` to resolve with null (user not found)
        findByIdAndDeleteStub.resolves(null);
      
        const response = await request(app).delete("/users/12345").expect(404);
      
        expect(response.body).to.have.property("error", "User not found");
      });
      
      it("should respond with status 500 when there is a server error", async () => {
        // Stub `findByIdAndDelete` to simulate a server error
        findByIdAndDeleteStub.rejects(new Error("Database error"));
      
        const response = await request(app).delete("/users/12345").expect(500);
      
        expect(response.body).to.have.property("error", "Database error");
      });
      });
    