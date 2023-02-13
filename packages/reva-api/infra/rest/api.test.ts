/**
 * @jest-environment ./test/fastify-test-env.ts
 */
test("Ping should pong", async () => {
  const response = await (global as any).fastify.inject({
    method: "GET",
    url: "/ping",
  });
  expect(response.statusCode).toEqual(200);
  expect(response.body).toEqual("pong");
});
