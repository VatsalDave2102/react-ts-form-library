import { act, renderHook, waitFor } from "@testing-library/react";
import { useForm } from "../hooks/useForm";

describe("useForm", () => {
  it("should initialize with empty values and errors, touched, and dirty states", () => {
    const { result } = renderHook(() =>
      useForm<{ name: string; email: string }>()
    );

    expect(result.current.values).toEqual({});
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.dirty).toEqual({});
  });

  it("should update values when input changes and mark field as dirty on change", () => {
    const { result } = renderHook(() => useForm<{ name: string }>());

    act(() => {
      const event = {
        target: { value: "John" },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.register("name").onChange(event);
    });

    expect(result.current.values).toEqual({ name: "John" });
    expect(result.current.dirty.name).toBe(true);
  });

  it("should validate required fields", async () => {
    const { result } = renderHook(() => useForm<{ name: string }>());

    act(() => {
      const register = result.current.register("name", { required: true });
      register.onChange({
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      result.current.register("name", { required: true }).onBlur();
    });

    await waitFor(() => {
      expect(result.current.errors).toEqual({ name: "This field is required" });
    });
  });

  it("should show custom error message for required field", async () => {
    const { result } = renderHook(() => useForm<{ name: string }>());

    act(() => {
      const register = result.current.register("name", {
        required: { value: true, message: "Name is required!" },
      });
      register.onChange({
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      result.current
        .register("name", {
          required: { value: true, message: "Name is required!" },
        })
        .onBlur();
    });

    await waitFor(() => {
      expect(result.current.errors.name).toBe("Name is required!");
    });
  });

  it("should validate pattern", async () => {
    const { result } = renderHook(() => useForm<{ email: string }>());

    const pattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

    act(() => {
      const register = result.current.register("email", {
        pattern,
      });

      register.onChange({
        target: { value: "invalidemail" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      result.current
        .register("email", {
          pattern,
        })
        .onBlur();
    });

    await waitFor(() => {
      expect(result.current.errors).toEqual({ email: "Invalid format" });
    });
  });

  it("should show custom error message for pattern fields", async () => {
    const { result } = renderHook(() => useForm<{ email: string }>());
    const pattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

    act(() => {
      const register = result.current.register("email", {
        pattern: { value: pattern, message: "Email is invalid!" },
      });

      register.onChange({
        target: { value: "invalidemail" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      result.current
        .register("email", {
          pattern: { value: pattern, message: "Email is invalid!" },
        })
        .onBlur();
    });

    await waitFor(() => {
      expect(result.current.errors).toEqual({ email: "Email is invalid!" });
    });
  });

  it("should mark field as touched on blur", () => {
    const { result } = renderHook(() => useForm<{ name: string }>());

    act(() => {
      const { onBlur } = result.current.register("name");
      onBlur();
    });

    expect(result.current.touched.name).toBe(true);
  });

  it("should handle form submission with valid data", () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() => useForm<{ name: string }>());

    act(() => {
      const register = result.current.register("name", { required: true });
      register.onChange({
        target: { value: "John" },
      } as React.ChangeEvent<HTMLInputElement>);
      register.onBlur();
    });

    act(() => {
      result.current.handleSubmit(onSubmit)({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    expect(onSubmit).toHaveBeenCalledWith({ name: "John" });
  });

  it("should not submit form with invalid data", () => {
    const onSubmit = jest.fn();
    const { result } = renderHook(() => useForm<{ name: string }>());

    act(() => {
      const register = result.current.register("name", { required: true });
      register.onChange({
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>);
      register.onBlur();
    });

    act(() => {
      result.current.handleSubmit(onSubmit)({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent);
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.errors).toEqual({ name: "This field is required" });
  });
});
