import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import React, { useEffect, useState } from "react";
import * as yup from "yup";
import { BeatLoader } from "react-spinners";
import Error from "./Error";
import useFetch from "./hooks/useFetch";
import { signup } from "@/db/apiAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UrlState } from "./Context";


const Signup = () => {
  const [formData, setFormData] = useState({ name:"", email: "", password: "", profile_pic: null});
  const [errors, setErrors] = useState([]);

  const navigate = useNavigate();
  let [searchParams] = useSearchParams();
  const longLink = searchParams.get("createNew");

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const { data, error, loading, fn: fnSignup } = useFetch(signup, formData);
  const {fetchUser} = UrlState();
  useEffect(() => {
    if (error === null && data) {
      navigate(`/dashboard?${longLink ? `createNew=${longLink}`: ""}`);
      fetchUser();

    }
    console.log(data);
  }, [error, loading]);

  const handleSignup = async () => {
    setErrors([]);
    try {
      const schema = yup.object().shape({
        name: yup.string().required("Name is required"),
        email: yup
          .string()
          .email("Invalid email")
          .required("Email is required"),
        password: yup
          .string()
          .min(6, "Password must be at least 6 characters")
          .required("Password is required"),
        profile_pic: yup.mixed().required("Profile Picture is required"),  
      });

      await schema.validate(formData, { abortEarly: false });
      //api call
      await fnSignup();
    } catch (e) {
      const newErrors = {};

      e?.inner?.forEach((err) => {
        newErrors[err.path] = err.message;
      });

      setErrors(newErrors);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>SignUp</CardTitle>
        <CardDescription>
          Create a new account if you haven&rsquo;t already 
        </CardDescription>
        {errors.email && <Error message={errors.message} />}
      </CardHeader>
      <CardContent className="space-y-2">
      <div className="space-y-1">
          <Input
            name="name"
            type="text"
            placeholder="Enter Your Name"
            onChange={handleInputChange}
          />
          {errors.name && <Error message={errors.name} />}
        </div>
        <div className="space-y-1">
          <Input
            name="email"
            type="email"
            placeholder="Enter Email"
            onChange={handleInputChange}
          />
          {errors.email && <Error message={errors.email} />}
        </div>
        <div className="space-y-1">
          <Input
            name="password"
            type="password"
            placeholder="Enter Password"
            onChange={handleInputChange}
          />
          {errors.password && <Error message={errors.password} />}
        </div>
        <div className="space-y-1">
          <Input
            name="profile_pic"
            type="file"
            accept="image/*"
            onChange={handleInputChange}
          />
          {errors.profile_pic && <Error message={errors.profile_pic} />}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSignup}>
          {loading ? <BeatLoader size={10} color="#36d7b7" /> : "Create Account"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Signup;
