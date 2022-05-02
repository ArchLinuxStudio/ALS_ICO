import {
  Box,
  Text,
  ButtonGroup,
  Link,
  VStack,
  Code,
  Grid,
  GridItem,
  Heading,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  StatArrow,
  StatGroup,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Button,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Center,
  InputRightElement,
  InputGroup,
  Input,
  Flex,
  Spacer,
  IconButton,
  Circle,
  Stack,
  useColorMode,
  useMediaQuery,
  useToast,
  Image,
  HStack,
  Icon,
  FormControl,
  useColorModeValue,
  chakra,
  SimpleGrid,
} from "@chakra-ui/react";
import { ColorModeSwitcher } from "@/ColorModeSwitcher";
import { Logo } from "@/Logo";
import { useCallback, useEffect, useRef, useState } from "react";
import Web3 from "web3";
import { BlockHeader, Block } from "web3-eth"; // ex. package types
import ALSToken from "@/blockchain/build/contracts/ALSToken.json";
import ALSTokenSale from "@/blockchain/build/contracts/ALSTokenSale.json";
import { FaTelegram, FaGithub } from "react-icons/fa";
import { SiMatrix } from "react-icons/si";
import _ from "lodash";

declare let window: any;

export const App = () => {
  const toast = useToast();

  const { colorMode } = useColorMode();

  const isDark = colorMode === "dark";
  const [isNotSmallerScreen] = useMediaQuery("(min-width:600px)");

  const [userAccount, setUserAccount] = useState("");

  const [tokenPrice, setTokenPrice] = useState(0);

  const [tokenContractAddress, setTokenContractAddress] = useState("0x0");
  const [tokenSaleContractAddress, setTokenSaleContractAddress] =
    useState("0x0");

  const [tokensSold, setTokensSold] = useState(0);

  const [userAccountTokenBalance, setUserAccountTokenBalance] = useState(0);

  const [totalSupply, setTotalSupply] = useState(0);

  const [saleContractBalance, setSaleContractBalance] = useState(0);

  const [buyNumber, setBuyNumber] = useState(1);

  const [tokenInstance, setTokenInstance] = useState({} as any);
  const [tokenSaleInstance, setTokenSaleInstance] = useState({} as any);

  const fetchData = async () => {
    let price = await tokenSaleInstance.tokenPrice();
    setTokenPrice(parseFloat(Web3.utils.fromWei(price)));
    let tokensSold = await tokenSaleInstance.tokensSold();
    setTokensSold(tokensSold.toNumber());
    let balance = await tokenInstance.balanceOf(userAccount);
    setUserAccountTokenBalance(balance.toNumber());

    let totalSupply = await tokenInstance.totalSupply();
    setTotalSupply(totalSupply.toNumber());

    let saleContractBalance = await tokenInstance.balanceOf(
      tokenSaleInstance.address
    );
    setSaleContractBalance(saleContractBalance.toNumber());
  };

  useEffect(() => {
    if (!_.isEmpty(tokenInstance) && !_.isEmpty(tokenSaleInstance)) {
      fetchData();
      listenForEvents();
    }
  }, [tokenInstance, tokenSaleInstance]);

  useEffect(() => {
    const initProject = async () => {
      if (window.ethereum) {
        // connect metamask
        await window.ethereum.request({ method: "eth_requestAccounts" });
        // create web3
        let web3 = new Web3(window.ethereum);
        let web3Provider = web3.currentProvider;
        //can not use import for @truffle/contract in typescript now
        const TruffleContract = require("@truffle/contract");
        let ALSTokenABS = TruffleContract(ALSToken);
        let ALSTokenSaleABS = TruffleContract(ALSTokenSale);

        ALSTokenABS.setProvider(web3Provider);
        ALSTokenSaleABS.setProvider(web3Provider);

        let accounts = await web3.eth.getAccounts();
        setUserAccount(accounts[0]);

        let ALSTokenInstance = await ALSTokenABS.deployed();
        setTokenInstance(ALSTokenInstance);
        setTokenContractAddress(ALSTokenInstance.address);
        let ALSTokenSaleInstance = await ALSTokenSaleABS.deployed();
        setTokenSaleInstance(ALSTokenSaleInstance);
        setTokenSaleContractAddress(ALSTokenSaleInstance.address);
      } else {
        toast({
          title:
            "⚠️ Please install an Ethereum-compatible browser or extension like MetaMask to use this DApp!",
          status: "warning",
          duration: 7000,
          isClosable: true,
        });
      }
    };

    initProject();
  }, []);

  const buyTokens = async () => {
    toast({
      title: "Please wait...",
      description: "The network needs time to complete your transaction.",
      status: "info",
      duration: 5000,
      isClosable: true,
    });

    let result = await tokenSaleInstance.buyTokens(buyNumber, {
      from: userAccount,
      value: Web3.utils.toWei((buyNumber * tokenPrice).toString()),
      gas: 500000,
    });

    toast({
      title: "🎉Purchase successfully!",
      description: "We've send tokens for you.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });

    // fetchData();
    setBuyNumber(1);
  };

  const handleBuyNumberChanged = async (value: string) => {
    setBuyNumber(parseInt(value));
    console.log(value);
  };

  // Listen for events emitted from the contract
  const listenForEvents = async () => {
    if (!_.isEmpty(tokenSaleInstance)) {
      console.log("waiting./..");

      await tokenSaleInstance.Sell({ filter: {}, fromBlock: 0 }, async () => {
        await fetchData();
      });
    }
  };

  return (
    <VStack p={5}>
      {/* TOP LINE */}
      <Flex w="100%">
        <Heading ml="2" size="md" fontWeight="semibold" color="cyan.400">
          ALSTokenSale
        </Heading>
        <Spacer></Spacer>
        <Link href="https://matrix.to/#/#ArchLinuxStudio:matrix.org" isExternal>
          <IconButton
            icon={<SiMatrix />}
            size="sm"
            aria-label={""}
          ></IconButton>
        </Link>
        <Link href="https://t.me/FSF_Ministry_of_Truth" isExternal>
          <IconButton
            ml={2}
            size="sm"
            icon={<FaTelegram />}
            aria-label={""}
          ></IconButton>
        </Link>
        <Link href="https://github.com/ArchLinuxStudio" isExternal>
          <IconButton
            ml={2}
            size="sm"
            icon={<FaGithub />}
            aria-label={""}
          ></IconButton>
        </Link>
        <ColorModeSwitcher />
      </Flex>

      {/* HEADER */}
      <Stack w="90%">
        <Circle
          position="absolute"
          bg="blue.100"
          opacity="0.1"
          size="250px"
          alignSelf="flex-end"
        />
        <Flex
          direction={isNotSmallerScreen ? "row" : "column"}
          // spacing="200px"
          p={isNotSmallerScreen ? "32" : "0"}
          alignSelf="flex-start"
        >
          <Box
            mt={isNotSmallerScreen ? "0" : 16}
            // align="flex-start"
          >
            <Text
              fontSize={isNotSmallerScreen ? "5xl" : "3xl"}
              fontWeight="semibold"
            >
              👋Hi~ Prepare for
            </Text>
            <Text
              fontSize={isNotSmallerScreen ? "7xl" : "4xl"}
              fontWeight="bold"
              bgGradient="linear(to-r, cyan.400, blue.500, purple.600)"
              bgClip="text"
            >
              ALS TOKEN SALE!
            </Text>
            <Text color={isDark ? "gray.200" : "gray.500"}>
              ALS is a ERC20 token, used for creating and issuing smart
              contracts on the Ethereum blockchain. ALS TOKEN is used to promote
              the development of free software, as well as to ensure free access
              to the Internet, breaking the Internet blockade.
            </Text>
            <Button
              mt={8}
              colorScheme="blue"
              onClick={() =>
                window.open("https://github.com/ArchLinuxStudio/ALS_ICO")
              }
            >
              Source Code
            </Button>
          </Box>
          <Logo
            mt={isNotSmallerScreen ? "0" : "12"}
            mb={isNotSmallerScreen ? "0" : "12"}
            boxSize="250px"
            pointerEvents="none"
            alignSelf="center"
            boxShadow="lg"
            borderRadius="full"
            backgroundColor="transparent"
          />
        </Flex>
      </Stack>

      {/* MID */}
      <Stack w="80%">
        <Flex
          direction={isNotSmallerScreen ? "row" : "column"}
          p={isNotSmallerScreen ? "32" : "0"}
          alignSelf="flex-start"
          paddingTop={0}
          paddingBottom={0}
        >
          <Box mt={isNotSmallerScreen ? "0" : 16}>
            <Heading fontWeight="extrabold" color="cyan.500" size="4xl">
              5+
            </Heading>
            <Text fontSize="2xl" color="gray.400">
              Years of Experience
            </Text>
            <br />
            <Text fontWeight="bold" fontSize="2xl">
              The members of the ALS organization are experienced and
              enthusiastic. Developers have developed a lot of free software and
              written a lot of documentation.
            </Text>
            <Text color="white" fontSize="xl" fontWeight="semibold">
              {tokensSold}/{saleContractBalance + tokensSold} tokens sold
            </Text>
            <Progress
              colorScheme={"pink"}
              hasStripe
              value={(tokensSold / (saleContractBalance + tokensSold)) * 100}
            />
          </Box>

          <Stack
            spacing={4}
            w={"full"}
            maxW={"md"}
            rounded={"xl"}
            boxShadow={"lg"}
            p={6}
            my={12}
            ml={isNotSmallerScreen ? "30" : "0"}
          >
            <Heading lineHeight={1.1} fontSize={{ base: "1xl", md: "2xl" }}>
              You currently have {userAccountTokenBalance} ALS
            </Heading>
            <Text fontSize={{ base: "sm", sm: "md" }}>Buy some more?</Text>
            <FormControl>
              <NumberInput
                defaultValue={buyNumber}
                min={1}
                max={saleContractBalance}
                onChange={handleBuyNumberChanged}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            {/* <Stack spacing={6}> */}
            <Button colorScheme="blue" onClick={buyTokens}>
              Buy Tokens
            </Button>
            {/* </Stack> */}
          </Stack>
        </Flex>
      </Stack>

      {/* STATISTICS */}
      <Stack>
        <Box maxW="7xl" mx={"auto"} pt={5} px={{ base: 2, sm: 12, md: 17 }}>
          <chakra.h1
            textAlign={"center"}
            fontSize={"4xl"}
            py={10}
            fontWeight={"bold"}
          >
            Transparency, so trust🏯
          </chakra.h1>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 5, lg: 8 }}>
            <Stat
              p="2"
              rounded={"lg"}
              px={{ base: 4, md: 8 }}
              py={"5"}
              shadow={"xl"}
              border={"1px solid"}
            >
              <StatLabel>TOKEN PRICE:</StatLabel>
              <StatNumber>{tokenPrice} ETH</StatNumber>
              <StatHelpText>Apr 25 - Nov 28</StatHelpText>
            </Stat>

            <Stat
              p="2"
              rounded={"lg"}
              px={{ base: 4, md: 8 }}
              py={"5"}
              shadow={"xl"}
              border={"1px solid"}
            >
              <StatGroup p="2">
                <Stat>
                  <StatLabel>MARKET</StatLabel>
                  <StatNumber>345,670</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    23.36%
                  </StatHelpText>
                </Stat>
                <Stat ml={5}>
                  <StatLabel>CLICKED</StatLabel>
                  <StatNumber>45</StatNumber>
                  <StatHelpText>
                    <StatArrow type="decrease" />
                    9.05%
                  </StatHelpText>
                </Stat>
              </StatGroup>
            </Stat>

            <Stat
              p="2"
              rounded={"lg"}
              px={{ base: 4, md: 8 }}
              py={"5"}
              shadow={"xl"}
              border={"1px solid"}
            >
              <StatLabel>Token contract address:</StatLabel>
              <StatNumber fontSize={"medium"}>
                {tokenContractAddress}
              </StatNumber>
            </Stat>

            <Stat
              p="2"
              rounded={"lg"}
              px={{ base: 4, md: 8 }}
              py={"5"}
              shadow={"xl"}
              border={"1px solid"}
            >
              <StatLabel>Token sale contract address:</StatLabel>
              <StatNumber fontSize={"medium"}>
                {tokenSaleContractAddress}
              </StatNumber>
            </Stat>

            <Stat
              p="2"
              rounded={"lg"}
              px={{ base: 4, md: 8 }}
              py={"5"}
              shadow={"xl"}
              border={"1px solid"}
            >
              <StatLabel>Your account address:</StatLabel>
              <StatNumber fontSize={"medium"}>{userAccount}</StatNumber>
            </Stat>
          </SimpleGrid>
        </Box>
      </Stack>

      {/* FOOTER */}
      <Stack>
        <Center>
          <Alert
            status="info"
            marginTop={100}
            width={isNotSmallerScreen ? "70%" : "100%"}
          >
            <AlertIcon />
            NOTICE: This token sale uses in Rinkeby Test Network with fake
            ether. Use a browser extension like Metamask to connect to the test
            network and participate the ICO. Please be patient if the test
            network runs slowly.
          </Alert>
        </Center>
      </Stack>
    </VStack>
  );
};
