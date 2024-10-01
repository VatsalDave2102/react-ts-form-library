import { act, renderHook, waitFor } from "@testing-library/react";
import { useForm } from "..";

type TestForm = {
  name: string;
  email: string;
  address: {
    street: string;
    city: string;
  };
  hobbies: string[];
};

describe("nested-fields", () => {
  it("should initialize with empty values and errors", () => {
    const { result } = renderHook(() => useForm<TestForm>());

    expect(result.current.values).toEqual({});
    expect(result.current.errors).toEqual({});
  });

  it("should update flat field values", async () => {
    const { result } = renderHook(() => useForm<TestForm>());

    act(() => {
      const event = {
        target: { value: "Kashyap Patel" },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.register("name").onChange(event);
    });

    await waitFor(() => {
      expect(result.current.values).toEqual({ name: "Kashyap Patel" });
    });
  });

  it("should update nested field values", async () => {
    const { result } = renderHook(() => useForm<TestForm>());

    act(() => {
      const event = {
        target: { value: "Main St" },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.register("address.street").onChange(event);
    });

    await waitFor(() => {
      expect(result.current.values).toEqual({ address: { street: "Main St" } });
    });
  });

  it("should validate required fields", async () => {
    const { result } = renderHook(() => useForm<TestForm>());

    act(() => {
      const register = result.current.register("name", { required: true });
      register.onChange({
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
      register.onBlur();
    });

    await waitFor(() => {
      expect(result.current.errors).toEqual({ name: "This field is required" });
    });
  });

  it("should handle form submission with valid data", async () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() => useForm<TestForm>());

    act(() => {
      result.current.register("name", { required: true }).onChange({
        target: { value: "John Doe" },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current
        .register("email", {
          required: true,
          pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        })
        .onChange({
          target: { value: "john@example.com" },
        } as React.ChangeEvent<HTMLInputElement>);
      result.current.register("address.street", { required: true }).onChange({
        target: { value: "Main St" },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.register("address.city", { required: true }).onChange({
        target: { value: "New York" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      result.current.handleSubmit(onSubmit)({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        address: {
          street: "Main St",
          city: "New York",
        },
      });
    });
  });

  it("should not submit form with invalid data", async () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() => useForm<TestForm>());

    act(() => {
      result.current.register("name", { required: true }).onChange({
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
      result.current
        .register("email", {
          required: true,
          pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        })
        .onChange({
          target: { value: "invalidemail" },
        } as React.ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      result.current.handleSubmit(onSubmit)({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
      expect(result.current.errors).toEqual({
        name: "This field is required",
        email: "Invalid format",
      });
    });
  });

  it("should add and remove dynamic fields", async () => {
    const { result } = renderHook(() => useForm<TestForm>());

    act(() => {
      result.current.setFieldValue("hobbies", []);
    });

    act(() => {
      result.current.setFieldValue("hobbies.0", "Reading");
      result.current.setFieldValue("hobbies.1", "Cycling");
    });

    await waitFor(() => {
      expect(result.current.values).toEqual({
        hobbies: ["Reading", "Cycling"],
      });
      expect(result.current.dirty.hobbies).toBe(true);
    });

    act(() => {
      result.current.removeField("hobbies.0");
    });

    await waitFor(() => {
      expect(result.current.values).toEqual({
        hobbies: ["Cycling"],
      });
    });
  });

  it("should handle complex nested and dynamic fields", async () => {
    const { result } = renderHook(() => useForm<TestForm>());

    act(() => {
      result.current.setFieldValue("name", "John Doe");
      result.current.setFieldValue("email", "john@example.com");
      result.current.setFieldValue("address.street", "Main St");
      result.current.setFieldValue("address.city", "New York");
      result.current.setFieldValue("hobbies", []);
      result.current.setFieldValue("hobbies.0", "Reading");
      result.current.setFieldValue("hobbies.1", "Cycling");
    });

    await waitFor(() => {
      expect(result.current.values).toEqual({
        name: "John Doe",
        email: "john@example.com",
        address: {
          street: "Main St",
          city: "New York",
        },
        hobbies: ["Reading", "Cycling"],
      });
    });

    act(() => {
      result.current.removeField("address.city");
      result.current.removeField("hobbies.0");
    });

    await waitFor(() => {
      expect(result.current.values).toEqual({
        name: "John Doe",
        email: "john@example.com",
        address: {
          street: "Main St",
        },
        hobbies: ["Cycling"],
      });
      expect(result.current.errors["address.city"]).toBeUndefined();
      expect(result.current.dirty["address.city"]).toBeUndefined();
      expect(result.current.touched["address.city"]).toBeUndefined();
    });
  });
});
