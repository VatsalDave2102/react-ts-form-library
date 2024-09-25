import { act, renderHook, waitFor } from "@testing-library/react";
import { useForm } from "../hooks/useForm";

describe("useForm", () => {
  it("should initialize with empty values and errors", () => {
    const { result } = renderHook(() =>
      useForm<{ name: string; email: string }>()
    );

    expect(result.current.values).toEqual({});
    expect(result.current.errors).toEqual({});
  });

  it("should update values when input changes", () => {
    const { result } = renderHook(() => useForm<{ name: string }>());

    act(() => {
      const event = {
        target: { value: "John" },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.register("name").onChange(event);
    });

    expect(result.current.values).toEqual({ name: "John" });
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
