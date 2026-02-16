##Code Comprehension
1. What does this file do?
This file is has a function that sits between the request & response lifecycle.
It authenticates the user before allowing them to access any resources.



2. Trace the execution path
 - Request enters Express pipeline.
 - This middleware is invoked.
 - Reads: req.headers["authorization"]
 - Expected format: Bearer <token>
 - Splits on space → index 1 gives token.
 - If token missing → immediately returns 401.
 - Calls: jwt.verify(token, JWT_SECRET, callback)
 - Inside verify:
      * Validates signature
      * Validates expiration (if present)
      * Decodes payload
 - If error: Returns 403
 - If success: Mutates req.user
 - Calls next()
 - Control moves to next middleware or route handler.
 - Key mutation: req.user = user
That’s state injection into request lifecycle.



3. Identify Failure Modes

a. JWT_SECRET is undefined (environment misconfigured).
b. Authorization header format incorrect:
    - "Token xyz"
    - Just token without Bearer

c. Header casing differences.
d. jwt.verify throws synchronously (rare but possible if secret invalid).
e. Token signed with different secret.
f. Token algorithm mismatch.
g. Payload does not contain expected fields (e.g., no userId).
h. req.user conflicts with existing property.
i. Middleware not mounted before protected routes.


4. Identify 2 Design Tradeoffs
Tradeoff 1 — Stateless JWT vs Session Store
JWT:
 - No DB lookup per request
 - Scales horizontally easily
 - Harder to revoke
Sessions:
 - Requires store (Redis/DB)
 - Easier revocation
 - More stateful

Middleware is correct for scale.


5. One Improvement Suggestion
Improvement 1 — Validate Header Format Explicitly
Instead of: const token = authHeader && authHeader.split(" ")[1];
Better:
if (!authHeader?.startsWith("Bearer ")) {
  return res.status(401).json({ message: "Invalid authorization header format" });
}

Improvement 2 — Consistent Error Codes
Currently:
 - Missing token → 401
 - Invalid token → 403
Many APIs use:
 - 401 for both

Consistency matters.